import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';
import { positionFloating, resetFloating } from '../core/positioning.js?v=18.1.0';
import { createProxyValidation } from '../core/validation.js?v=18.1.0';

const controllers = new WeakMap();
let openDatePicker = null;
let datePickerSequence = 0;

const pad = value => String(value).padStart(2, '0');
const toIso = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const fromIso = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
    return Number.isNaN(date.valueOf()) || toIso(date) !== value ? null : date;
};
const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
const addMonths = (date, amount) => {
    const first = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12).getDate();
    return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), lastDay), 12);
};
const sameDay = (left, right) => left && right && toIso(left) === toIso(right);

const setup = root => {
    const input = root.querySelector('[data-design-system-date-picker-control]');
    const trigger = root.querySelector('[data-design-system-date-picker-trigger]');
    const value = root.querySelector('[data-design-system-date-picker-value]');
    const dialog = root.querySelector('[data-design-system-date-picker-dialog]');
    const missing = [];
    if (!(input instanceof HTMLInputElement) || input.type !== 'date') missing.push('native date input');
    if (!(trigger instanceof HTMLButtonElement)) missing.push('trigger button');
    if (!value) missing.push('value label');
    if (!dialog) missing.push('calendar dialog');
    if (missing.length) return reportEnhancementFailure(root, 'date-picker', missing);

    const controller = new AbortController();
    const { signal } = controller;
    const initialTriggerHidden = trigger.hidden;
    const initialLabelledBy = trigger.getAttribute('aria-labelledby');
    const initialDescribedBy = trigger.getAttribute('aria-describedby');
    const label = root.querySelector('.design-system-field-label');
    const generatedLabelId = Boolean(label && !label.id);
    const generatedValueId = !value.id;
    const identity = ++datePickerSequence;
    if (generatedLabelId) label.id = `design-system-date-picker-label-${identity}`;
    if (generatedValueId) value.id = `design-system-date-picker-value-${identity}`;
    if (label) trigger.setAttribute('aria-labelledby', `${label.id} ${value.id}`);
    if (input.getAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
    const validation = createProxyValidation({ root, control: input, proxy: trigger, component: 'date-picker' });
    const today = new Date();
    const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
    let view = fromIso(input.value) ?? todayAtNoon;
    let focusedDate = fromIso(input.value) ?? todayAtNoon;
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
    const valueFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'short' });
    const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    const dayFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });
    const emptyLabel = root.dataset.designSystemEmptyLabel || value.textContent?.trim() || 'Choose a date';
    const previousMonthLabel = root.dataset.designSystemPreviousMonthLabel || 'Previous month';
    const nextMonthLabel = root.dataset.designSystemNextMonthLabel || 'Next month';
    const todayLabel = root.dataset.designSystemTodayLabel || 'Today';
    const clearLabel = root.dataset.designSystemClearLabel || 'Clear';
    let firstDayOfWeek = 0;
    try {
        const locale = new Intl.Locale(monthFormatter.resolvedOptions().locale);
        const weekInfo = locale.weekInfo ?? locale.getWeekInfo?.();
        firstDayOfWeek = (weekInfo?.firstDay ?? 7) % 7;
    } catch { /* Sunday remains a complete fallback where Intl.Locale is unavailable. */ }

    const isAllowed = date => {
        const iso = toIso(date);
        return (!input.min || iso >= input.min) && (!input.max || iso <= input.max);
    };

    const makeButton = (className, label, text, action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.dataset.designSystemButton = '';
        button.setAttribute('aria-label', label);
        button.dataset.designSystemDateAction = action;
        button.textContent = text;
        return button;
    };
    const makeIconButton = (label, iconName, action) => {
        const button = makeButton('design-system-button design-system-icon-button', label, '', action);
        button.dataset.designSystemIconOnly = '';
        const icon = document.createElement('span');
        icon.className = 'design-system-icon design-system-icon--small';
        icon.dataset.designSystemIcon = iconName;
        icon.setAttribute('aria-hidden', 'true');
        button.append(icon);
        return button;
    };

    const render = (focusIso = null) => {
        dialog.replaceChildren();

        const header = document.createElement('div');
        header.className = 'design-system-date-header';
        const previous = makeIconButton(previousMonthLabel, 'chevron-left', 'previous');
        previous.dataset.designSystemVariant = 'text';
        previous.dataset.designSystemTone = 'neutral';
        previous.dataset.designSystemSize = 'small';
        const previousMonthLastDay = new Date(view.getFullYear(), view.getMonth(), 0, 12);
        previous.disabled = Boolean(input.min && toIso(previousMonthLastDay) < input.min);
        const heading = document.createElement('div');
        heading.className = 'design-system-date-heading';
        heading.id = `${dialog.id || input.id}-heading`;
        heading.setAttribute('aria-live', 'polite');
        heading.textContent = monthFormatter.format(view);
        const next = makeIconButton(nextMonthLabel, 'chevron-right', 'next');
        next.dataset.designSystemVariant = 'text';
        next.dataset.designSystemTone = 'neutral';
        next.dataset.designSystemSize = 'small';
        const nextMonthFirstDay = new Date(view.getFullYear(), view.getMonth() + 1, 1, 12);
        next.disabled = Boolean(input.max && toIso(nextMonthFirstDay) > input.max);
        header.append(previous, heading, next);

        const grid = document.createElement('div');
        grid.className = 'design-system-date-grid';
        grid.setAttribute('role', 'grid');
        grid.setAttribute('aria-labelledby', heading.id);
        const weekdayRow = document.createElement('div');
        weekdayRow.className = 'design-system-date-row';
        weekdayRow.setAttribute('role', 'row');
        const weekStart = addDays(todayAtNoon, firstDayOfWeek - todayAtNoon.getDay());
        for (let index = 0; index < 7; index += 1) {
            const weekday = document.createElement('div');
            weekday.className = 'design-system-date-weekday';
            weekday.setAttribute('role', 'columnheader');
            weekday.textContent = weekdayFormatter.format(addDays(weekStart, index));
            weekdayRow.append(weekday);
        }
        grid.append(weekdayRow);

        const first = new Date(view.getFullYear(), view.getMonth(), 1, 12);
        const gridStart = addDays(first, -((first.getDay() - firstDayOfWeek + 7) % 7));
        const selected = fromIso(input.value);
        for (let week = 0; week < 6; week += 1) {
            const row = document.createElement('div');
            row.className = 'design-system-date-row';
            row.setAttribute('role', 'row');
            for (let day = 0; day < 7; day += 1) {
                const date = addDays(gridStart, (week * 7) + day);
                const iso = toIso(date);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'design-system-date-day';
                button.dataset.designSystemDate = iso;
                button.setAttribute('role', 'gridcell');
                button.setAttribute('aria-label', dayFormatter.format(date));
                button.setAttribute('aria-selected', sameDay(date, selected) ? 'true' : 'false');
                button.tabIndex = iso === (focusIso ?? toIso(focusedDate)) ? 0 : -1;
                button.textContent = String(date.getDate());
                button.disabled = !isAllowed(date);
                if (date.getMonth() !== view.getMonth()) button.dataset.designSystemOutside = 'true';
                if (sameDay(date, todayAtNoon)) button.dataset.designSystemToday = 'true';
                row.append(button);
            }
            grid.append(row);
        }

        const footer = document.createElement('div');
        footer.className = 'design-system-date-footer';
        const todayButton = makeButton('design-system-button', todayLabel, todayLabel, 'today');
        todayButton.dataset.designSystemVariant = 'text';
        todayButton.dataset.designSystemTone = 'accent';
        todayButton.dataset.designSystemSize = 'small';
        todayButton.disabled = !isAllowed(todayAtNoon);
        const clearButton = makeButton('design-system-button', clearLabel, clearLabel, 'clear');
        clearButton.dataset.designSystemVariant = 'text';
        clearButton.dataset.designSystemTone = 'neutral';
        clearButton.dataset.designSystemSize = 'small';
        clearButton.disabled = input.required || !input.value;
        footer.append(todayButton, clearButton);

        dialog.append(header, grid, footer);
        if (focusIso) requestAnimationFrame(() => dialog.querySelector(`[data-design-system-date="${CSS.escape(focusIso)}"]`)?.focus({ preventScroll: true }));
    };

    const sync = () => {
        const selected = fromIso(input.value);
        value.textContent = selected ? valueFormatter.format(selected) : emptyLabel;
        root.dataset.designSystemHasValue = selected ? 'true' : 'false';
        trigger.disabled = input.disabled;
        if (input.getAttribute('aria-invalid')) trigger.setAttribute('aria-invalid', input.getAttribute('aria-invalid'));
        else trigger.removeAttribute('aria-invalid');
        if (selected) {
            view = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
            focusedDate = selected;
        }
        if (!dialog.hidden) render();
    };

    const reposition = () => {
        if (!dialog.hidden) positionFloating(trigger, dialog, { alignment: 'start' });
    };

    const close = (reason = 'dismiss', restoreFocus = false) => {
        if (dialog.hidden) return;
        dialog.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        resetFloating(dialog);
        if (openDatePicker?.root === root) openDatePicker = null;
        if (restoreFocus && trigger.isConnected) trigger.focus();
        emit(root, 'close', { component: 'date-picker', reason, value: input.value });
    };

    const open = () => {
        if (input.disabled || trigger.disabled || !dialog.hidden) return;
        openDatePicker?.close('another-date-picker', false);
        const selected = fromIso(input.value);
        focusedDate = selected ?? todayAtNoon;
        view = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1, 12);
        render();
        dialog.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        openDatePicker = { root, close };
        reposition();
        requestAnimationFrame(() => (dialog.querySelector('[data-design-system-date][tabindex="0"]:not(:disabled)')
            ?? dialog.querySelector('[data-design-system-date]:not(:disabled)'))?.focus({ preventScroll: true }));
        emit(root, 'open', { component: 'date-picker', value: input.value });
    };

    const choose = date => {
        if (!date || !isAllowed(date)) return;
        input.value = toIso(date);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        sync();
        emit(root, 'change', { component: 'date-picker', value: input.value });
        close('selection', true);
    };

    const moveFocus = next => {
        if (input.min && toIso(next) < input.min) next = fromIso(input.min) ?? next;
        if (input.max && toIso(next) > input.max) next = fromIso(input.max) ?? next;
        focusedDate = next;
        view = new Date(next.getFullYear(), next.getMonth(), 1, 12);
        render(toIso(next));
        reposition();
    };

    trigger.addEventListener('click', () => dialog.hidden ? open() : close('trigger', true), { signal });
    trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            open();
        }
    }, { signal });
    dialog.addEventListener('click', event => {
        const day = event.target.closest?.('[data-design-system-date]');
        if (day && !day.disabled) {
            choose(fromIso(day.dataset.designSystemDate));
            return;
        }
        const action = event.target.closest?.('[data-design-system-date-action]')?.dataset.designSystemDateAction;
        if (action === 'previous' || action === 'next') {
            view = addMonths(view, action === 'previous' ? -1 : 1);
            focusedDate = new Date(view.getFullYear(), view.getMonth(), 1, 12);
            render();
            reposition();
            requestAnimationFrame(() => dialog.querySelector(`[data-design-system-date-action="${action}"]`)?.focus());
        } else if (action === 'today') {
            choose(todayAtNoon);
        } else if (action === 'clear') {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            sync();
            emit(root, 'change', { component: 'date-picker', value: '' });
            close('clear', true);
        }
    }, { signal });
    dialog.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            close('escape', true);
            return;
        }
        if (event.key === 'Tab') {
            queueMicrotask(() => {
                if (!dialog.contains(document.activeElement)) close('tab', false);
            });
            return;
        }
        const day = event.target.closest?.('[data-design-system-date]');
        if (!day) return;
        const current = fromIso(day.dataset.designSystemDate);
        let next = null;
        if (event.key === 'ArrowLeft') next = addDays(current, -1);
        else if (event.key === 'ArrowRight') next = addDays(current, 1);
        else if (event.key === 'ArrowUp') next = addDays(current, -7);
        else if (event.key === 'ArrowDown') next = addDays(current, 7);
        else if (event.key === 'Home') next = addDays(current, -((current.getDay() - firstDayOfWeek + 7) % 7));
        else if (event.key === 'End') next = addDays(current, 6 - ((current.getDay() - firstDayOfWeek + 7) % 7));
        else if (event.key === 'PageUp') next = addMonths(current, event.shiftKey ? -12 : -1);
        else if (event.key === 'PageDown') next = addMonths(current, event.shiftKey ? 12 : 1);
        else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            choose(current);
            return;
        } else return;
        event.preventDefault();
        moveFocus(next);
    }, { signal });
    input.addEventListener('change', sync, { signal });
    input.addEventListener('invalid', event => {
        event.preventDefault();
        validation.show();
        trigger.focus();
        emit(root, 'invalid', { component: 'date-picker', value: input.value });
    }, { signal });
    input.addEventListener('input', () => {
        if (input.validity.valid) {
            validation.clear();
            sync();
        }
    }, { signal });
    input.form?.addEventListener('reset', () => queueMicrotask(() => {
        validation.clear();
        sync();
    }), { signal });
    document.addEventListener('pointerdown', event => {
        if (!dialog.hidden && !root.contains(event.target)) close('outside', false);
    }, { capture: true, signal });
    window.addEventListener('resize', reposition, { signal });
    window.addEventListener('scroll', reposition, { capture: true, signal });

    const restoreEnhancement = markEnhanced(root, 'date-picker');
    trigger.hidden = false;
    dialog.hidden = true;
    sync();

    return {
        abort() {
            close('destroy', false);
            controller.abort();
            validation.abort();
            dialog.replaceChildren();
            trigger.hidden = initialTriggerHidden;
            if (initialLabelledBy) trigger.setAttribute('aria-labelledby', initialLabelledBy);
            else trigger.removeAttribute('aria-labelledby');
            if (initialDescribedBy) trigger.setAttribute('aria-describedby', initialDescribedBy);
            else trigger.removeAttribute('aria-describedby');
            if (generatedLabelId) label.removeAttribute('id');
            if (generatedValueId) value.removeAttribute('id');
            restoreEnhancement();
            delete root.dataset.designSystemHasValue;
        }
    };
};

const init = root => {
    for (const picker of elements(root, '[data-design-system-date-picker]')) {
        if (!controllers.has(picker)) {
            const controller = setup(picker);
            if (controller) controllers.set(picker, controller);
        }
    }
};

const destroy = root => {
    for (const picker of elements(root, '[data-design-system-date-picker]')) {
        controllers.get(picker)?.abort();
        controllers.delete(picker);
    }
};

export default { init, destroy };
