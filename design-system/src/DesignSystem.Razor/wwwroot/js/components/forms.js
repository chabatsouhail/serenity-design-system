import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';
import { createProxyValidation } from '../core/validation.js?v=18.1.0';

const controllers = new WeakMap();

const initSearch = search => {
    const input = search.querySelector('input[type="search"]');
    const clear = search.querySelector('[data-design-system-search-clear]');
    if (!(input instanceof HTMLInputElement) || !(clear instanceof HTMLButtonElement)) {
        return reportEnhancementFailure(search, 'search', ['search input', 'clear button']);
    }
    const controller = new AbortController();
    const initialHasValue = search.getAttribute('data-design-system-has-value');
    const initialClearDisabled = clear.disabled;
    const sync = () => {
        search.dataset.designSystemHasValue = input.value ? 'true' : 'false';
        clear.disabled = input.disabled || input.readOnly || !input.value;
    };
    input.addEventListener('input', sync, { signal: controller.signal });
    clear.addEventListener('click', () => {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.focus();
    }, { signal: controller.signal });
    input.form?.addEventListener('reset', () => queueMicrotask(sync), { signal: controller.signal });
    sync();
    const restoreEnhancement = markEnhanced(search, 'search');
    return {
        abort() {
            controller.abort();
            restoreEnhancement();
            if (initialHasValue === null) delete search.dataset.designSystemHasValue;
            else search.setAttribute('data-design-system-has-value', initialHasValue);
            clear.disabled = initialClearDisabled;
        }
    };
};

const initNumber = control => {
    const input = control.querySelector('input[type="number"]');
    if (!input) return reportEnhancementFailure(control, 'number-field', 'number input');
    const controller = new AbortController();
    const buttons = [...control.querySelectorAll('[data-design-system-number-step], [data-design-system-direction]')]
        .filter(button => ['down', 'up'].includes(button.dataset.designSystemNumberStep ?? button.dataset.designSystemDirection));
    if (!buttons.length) return reportEnhancementFailure(control, 'number-field', 'step buttons');
    const numeric = value => value === '' ? null : Number(value);
    const sync = () => {
        const value = numeric(input.value);
        const minimum = numeric(input.min);
        const maximum = numeric(input.max);
        for (const button of buttons) {
            const direction = button.dataset.designSystemNumberStep ?? button.dataset.designSystemDirection;
            button.disabled = input.disabled || input.readOnly ||
                (direction === 'down' && minimum !== null && value !== null && value <= minimum) ||
                (direction === 'up' && maximum !== null && value !== null && value >= maximum);
        }
    };
    for (const button of buttons) {
        button.addEventListener('click', event => {
            event.preventDefault();
            try {
                if ((button.dataset.designSystemNumberStep ?? button.dataset.designSystemDirection) === 'down') input.stepDown();
                else input.stepUp();
            } catch {
                return;
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            emit(control, 'change', { value: input.value });
            sync();
        }, { signal: controller.signal });
    }
    input.addEventListener('input', sync, { signal: controller.signal });
    input.form?.addEventListener('reset', () => queueMicrotask(sync), { signal: controller.signal });
    sync();
    const restoreEnhancement = markEnhanced(control, 'number-field');
    return {
        abort() {
            controller.abort();
            restoreEnhancement();
        }
    };
};

const initFile = control => {
    const input = control.querySelector('[data-design-system-file-upload-control], input[type="file"]');
    const enhancement = control.querySelector('[data-design-system-file-upload-enhancement]');
    const trigger = control.querySelector('[data-design-system-file-upload-trigger]');
    const name = control.querySelector('[data-design-system-file-upload-selection], [data-design-system-file-name]');
    const missing = [];
    if (!(input instanceof HTMLInputElement) || input.type !== 'file') missing.push('native file input');
    if (!enhancement) missing.push('enhancement container');
    if (!(trigger instanceof HTMLButtonElement)) missing.push('trigger button');
    if (!name) missing.push('selection label');
    if (missing.length) return reportEnhancementFailure(control, 'file-upload', missing);
    const controller = new AbortController();
    const marker = document.createComment('design-system-file-upload-control');
    const originalParent = input.parentNode;
    const originalNext = input.nextSibling;
    const originalEnhancementHidden = enhancement.hidden;
    const hadNativeClass = input.classList.contains('design-system-file-upload__native');
    const initialInputTabIndex = input.getAttribute('tabindex');
    const empty = name.dataset.designSystemEmptyLabel ?? name.textContent?.trim() ?? 'No file selected';
    name.dataset.designSystemEmptyLabel = empty;

    originalParent.insertBefore(marker, input);
    input.classList.add('design-system-file-upload__native');
    input.tabIndex = -1;
    enhancement.prepend(input);
    enhancement.hidden = false;
    const restoreEnhancement = markEnhanced(control, 'file-upload');
    const descriptions = new Set([
        ...(trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean),
        ...(input.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
    ]);
    if (descriptions.size) trigger.setAttribute('aria-describedby', [...descriptions].join(' '));
    if (input.getAttribute('aria-invalid')) trigger.setAttribute('aria-invalid', input.getAttribute('aria-invalid'));
    const validation = createProxyValidation({ root: control, control: input, proxy: trigger, component: 'file-upload' });

    const sync = () => {
        const names = [...(input.files ?? [])].map(file => file.name);
        name.textContent = names.length ? names.join(', ') : empty;
        enhancement.dataset.designSystemHasFile = names.length ? 'true' : 'false';
        enhancement.dataset.designSystemDisabled = input.disabled ? 'true' : 'false';
        control.dataset.designSystemHasFile = names.length ? 'true' : 'false';
        trigger.disabled = input.disabled;
    };
    trigger.addEventListener('click', () => {
        if (!input.disabled) input.click();
    }, { signal: controller.signal });
    input.addEventListener('invalid', event => {
        event.preventDefault();
        validation.show();
        trigger.focus();
        emit(control, 'invalid', { component: 'file-upload' });
    }, { signal: controller.signal });
    input.addEventListener('change', () => {
        if (input.validity.valid) validation.clear();
        sync();
        emit(control, 'change', { files: [...(input.files ?? [])] });
    }, { signal: controller.signal });
    input.form?.addEventListener('reset', () => queueMicrotask(() => {
        validation.clear();
        sync();
    }), { signal: controller.signal });
    sync();
    return {
        abort() {
            controller.abort();
            validation.abort();
            if (marker.parentNode) marker.parentNode.insertBefore(input, marker);
            else if (originalParent) originalParent.insertBefore(input, originalNext);
            marker.remove();
            if (!hadNativeClass) input.classList.remove('design-system-file-upload__native');
            if (initialInputTabIndex === null) input.removeAttribute('tabindex');
            else input.setAttribute('tabindex', initialInputTabIndex);
            enhancement.hidden = originalEnhancementHidden;
            delete enhancement.dataset.designSystemHasFile;
            delete enhancement.dataset.designSystemDisabled;
            delete control.dataset.designSystemHasFile;
            restoreEnhancement();
        }
    };
};

const initialize = (root, selector, factory) => {
    for (const element of elements(root, selector)) {
        if (controllers.has(element)) continue;
        const controller = factory(element);
        if (controller) controllers.set(element, controller);
    }
};

const init = root => {
    initialize(root, '.design-system-search', initSearch);
    initialize(root, '[data-design-system-number]', initNumber);
    initialize(root, '[data-design-system-file-upload]', initFile);
};

const destroy = root => {
    for (const element of elements(root, '.design-system-search, [data-design-system-number], [data-design-system-file-upload]')) {
        controllers.get(element)?.abort();
        controllers.delete(element);
    }
};

export default { init, destroy };
