import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';
import { positionFloating, resetFloating } from '../core/positioning.js?v=18.1.0';
import { createProxyValidation } from '../core/validation.js?v=18.1.0';

const controllers = new WeakMap();
let openPicker = null;
let pickerSequence = 0;

const enabledOptions = root => [...root.querySelectorAll('[data-design-system-picker-option]')]
    .filter(option => !option.hidden && !option.disabled && option.getAttribute('aria-disabled') !== 'true');

const setup = root => {
    const select = root.querySelector('[data-design-system-picker-control]');
    const trigger = root.querySelector('[data-design-system-picker-trigger]');
    const value = root.querySelector('[data-design-system-picker-value]');
    const popover = root.querySelector('[data-design-system-picker-popover]');
    const search = root.querySelector('[data-design-system-picker-search]');
    const options = [...root.querySelectorAll('[data-design-system-picker-option]')];
    const missing = [];
    if (!(select instanceof HTMLSelectElement)) missing.push('native select');
    if (!(trigger instanceof HTMLButtonElement)) missing.push('trigger button');
    if (!value) missing.push('value label');
    if (!popover) missing.push('popover');
    if (!options.length) missing.push('options');
    if (missing.length) return reportEnhancementFailure(root, 'picker', missing);

    const controller = new AbortController();
    const { signal } = controller;
    const initialTriggerHidden = trigger.hidden;
    const initialLabelledBy = trigger.getAttribute('aria-labelledby');
    const initialDescribedBy = trigger.getAttribute('aria-describedby');
    const label = root.querySelector('.design-system-field-label');
    const generatedLabelId = Boolean(label && !label.id);
    const generatedValueId = !value.id;
    const identity = ++pickerSequence;
    if (generatedLabelId) label.id = `design-system-picker-label-${identity}`;
    if (generatedValueId) value.id = `design-system-picker-value-${identity}`;
    if (label) trigger.setAttribute('aria-labelledby', `${label.id} ${value.id}`);
    if (select.getAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
    const validation = createProxyValidation({ root, control: select, proxy: trigger, component: 'picker' });
    let emptyMessage = null;
    let typeahead = '';
    let typeaheadTimer = 0;

    const nativeOption = option => [...select.options].find(item => item.value === option.dataset.designSystemValue);
    const optionLabel = option => nativeOption(option)?.textContent?.trim() || option.querySelector('.design-system-option-title')?.textContent?.trim() || option.textContent?.trim() || '';

    const sync = () => {
        const selectedNative = select.selectedOptions[0];
        const hasValue = Boolean(selectedNative && selectedNative.value);
        value.textContent = selectedNative?.textContent?.trim() || select.options[0]?.textContent?.trim() || '';
        root.dataset.designSystemHasValue = hasValue ? 'true' : 'false';
        trigger.disabled = select.disabled;
        if (select.getAttribute('aria-invalid')) trigger.setAttribute('aria-invalid', select.getAttribute('aria-invalid'));
        else trigger.removeAttribute('aria-invalid');
        for (const option of options) {
            const selected = option.dataset.designSystemValue === select.value;
            option.setAttribute('aria-selected', selected ? 'true' : 'false');
        }
    };

    const reposition = () => {
        if (!popover.hidden) positionFloating(trigger, popover, { alignment: root.dataset.designSystemAlign ?? 'start' });
    };

    const close = (reason = 'dismiss', restoreFocus = false) => {
        if (popover.hidden) return;
        popover.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        resetFloating(popover);
        if (openPicker?.root === root) openPicker = null;
        if (restoreFocus && trigger.isConnected) trigger.focus();
        emit(root, 'close', { component: 'picker', reason, value: select.value });
    };

    const focusOption = option => {
        if (!option) return;
        option.focus({ preventScroll: true });
        option.scrollIntoView({ block: 'nearest' });
    };

    const open = focusTarget => {
        if (select.disabled || trigger.disabled || !popover.hidden) return;
        openPicker?.close('another-picker', false);
        popover.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        openPicker = { root, close };
        if (search?.value) {
            search.value = '';
            filter();
        }
        reposition();
        const available = enabledOptions(root);
        const selected = available.find(option => option.getAttribute('aria-selected') === 'true');
        requestAnimationFrame(() => {
            if (search) search.focus({ preventScroll: true });
            else if (focusTarget === 'last') focusOption(available.at(-1));
            else focusOption(selected ?? available[0]);
        });
        emit(root, 'open', { component: 'picker', value: select.value });
    };

    const choose = option => {
        if (!option || option.disabled || option.getAttribute('aria-disabled') === 'true') return;
        const next = option.dataset.designSystemValue ?? '';
        if (select.value !== next) {
            select.value = next;
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            sync();
        }
        emit(root, 'change', { component: 'picker', value: next, label: optionLabel(option) });
        close('selection', true);
    };

    const filter = () => {
        const query = search?.value.trim().toLocaleLowerCase() ?? '';
        let visible = 0;
        for (const option of options) {
            const match = !query || optionLabel(option).toLocaleLowerCase().includes(query);
            option.hidden = !match;
            if (match && !option.disabled && option.getAttribute('aria-disabled') !== 'true') visible += 1;
        }
        if (!emptyMessage) {
            emptyMessage = document.createElement('p');
            emptyMessage.className = 'design-system-picker-empty';
            emptyMessage.setAttribute('role', 'status');
            emptyMessage.textContent = root.dataset.designSystemNoResultsLabel || 'No matching options';
            popover.append(emptyMessage);
        }
        emptyMessage.hidden = visible > 0;
        reposition();
    };

    trigger.addEventListener('click', () => popover.hidden ? open() : close('trigger', true), { signal });
    trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            open(event.key === 'ArrowUp' ? 'last' : 'first');
        }
    }, { signal });

    popover.addEventListener('click', event => {
        const option = event.target.closest?.('[data-design-system-picker-option]');
        if (option && popover.contains(option)) choose(option);
    }, { signal });

    popover.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            close('escape', true);
            return;
        }
        if (event.key === 'Tab') {
            queueMicrotask(() => close('tab', false));
            return;
        }
        const available = enabledOptions(root);
        const current = event.target.closest?.('[data-design-system-picker-option]');
        if (event.key === 'Enter' || event.key === ' ') {
            if (current) {
                event.preventDefault();
                choose(current);
            }
            return;
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            const index = Math.max(0, available.indexOf(current));
            const target = event.key === 'Home' ? available[0]
                : event.key === 'End' ? available.at(-1)
                    : event.key === 'ArrowDown' ? available[(index + 1) % available.length]
                        : available[(index - 1 + available.length) % available.length];
            focusOption(target);
            return;
        }
        if (!search && event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
            window.clearTimeout(typeaheadTimer);
            typeahead += event.key.toLocaleLowerCase();
            const match = available.find(option => optionLabel(option).toLocaleLowerCase().startsWith(typeahead));
            if (match) focusOption(match);
            typeaheadTimer = window.setTimeout(() => { typeahead = ''; }, 700);
        }
    }, { signal });

    search?.addEventListener('input', filter, { signal });
    search?.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            focusOption(enabledOptions(root)[0]);
        }
    }, { signal });
    select.addEventListener('change', sync, { signal });
    select.addEventListener('invalid', event => {
        event.preventDefault();
        validation.show();
        trigger.focus();
        emit(root, 'invalid', { component: 'picker', value: select.value });
    }, { signal });
    select.addEventListener('input', () => {
        if (select.validity.valid) {
            validation.clear();
            sync();
        }
    }, { signal });
    select.form?.addEventListener('reset', () => queueMicrotask(() => {
        validation.clear();
        sync();
    }), { signal });
    document.addEventListener('pointerdown', event => {
        if (!popover.hidden && !root.contains(event.target) && !popover.contains(event.target)) close('outside', false);
    }, { capture: true, signal });
    window.addEventListener('resize', reposition, { signal });
    window.addEventListener('scroll', reposition, { capture: true, signal });

    const restoreEnhancement = markEnhanced(root, 'picker');
    trigger.hidden = false;
    popover.hidden = true;
    sync();

    return {
        abort() {
            close('destroy', false);
            controller.abort();
            validation.abort();
            window.clearTimeout(typeaheadTimer);
            emptyMessage?.remove();
            for (const option of options) option.hidden = false;
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
    for (const picker of elements(root, '[data-design-system-picker]')) {
        if (!controllers.has(picker)) {
            const controller = setup(picker);
            if (controller) controllers.set(picker, controller);
        }
    }
};

const destroy = root => {
    for (const picker of elements(root, '[data-design-system-picker]')) {
        controllers.get(picker)?.abort();
        controllers.delete(picker);
    }
};

export default { init, destroy };
