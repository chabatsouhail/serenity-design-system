import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const controllers = new WeakMap();

const setupSegmented = group => {
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(group, 'segmented-control');
    const buttons = [...group.querySelectorAll('button')];
    const restoreButtonEnhancements = buttons.map(button => markEnhanced(button, 'segmented-control-item'));
    const isEnabled = button => button && !button.disabled && button.getAttribute('aria-disabled') !== 'true';
    const select = (button, notify = true) => {
        if (!isEnabled(button)) return;
        for (const item of buttons) {
            const selected = item === button;
            item.setAttribute('aria-pressed', selected ? 'true' : 'false');
            item.tabIndex = selected ? 0 : -1;
        }
        if (notify) emit(group, 'change', { value: button.value || button.dataset.designSystemValue || '' });
    };
    group.addEventListener('click', event => select(event.target.closest('button')), { signal: controller.signal });
    group.addEventListener('keydown', event => {
        const current = event.target.closest('button');
        if (!current) return;
        const available = buttons.filter(isEnabled);
        if (!available.length) return;
        const index = available.indexOf(current);
        let target;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = available[(index + 1) % available.length];
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = available[(index - 1 + available.length) % available.length];
        else if (event.key === 'Home') target = available[0];
        else if (event.key === 'End') target = available.at(-1);
        else return;
        event.preventDefault();
        select(target);
        target?.focus();
    }, { signal: controller.signal });
    select(buttons.find(button => button.getAttribute('aria-pressed') === 'true' && isEnabled(button)) ?? buttons.find(isEnabled), false);
    return { abort() { controller.abort(); for (const restore of restoreButtonEnhancements) restore(); restoreEnhancement(); } };
};

const setupChip = chip => {
    const remove = chip.querySelector('[data-design-system-chip-remove]');
    if (!remove) return null;
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(chip, 'chip');
    const restoreRemoveEnhancement = markEnhanced(remove, 'chip-remove');
    remove?.addEventListener('click', () => {
        const value = chip.dataset.designSystemValue ?? '';
        if (emit(chip, 'remove', { value }, { cancelable: true })) chip.remove();
    }, { signal: controller.signal });
    return { abort() { controller.abort(); restoreRemoveEnhancement(); restoreEnhancement(); } };
};

const setupToggle = toggle => {
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(toggle, 'toggle-button');
    toggle.addEventListener('click', () => {
        if (toggle.disabled || toggle.getAttribute('aria-disabled') === 'true' || toggle.getAttribute('aria-busy') === 'true') return;
        const pressed = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
        emit(toggle, 'change', { component: 'button', pressed, value: toggle.value || toggle.dataset.designSystemValue || '' });
    }, { signal: controller.signal });
    return { abort() { controller.abort(); restoreEnhancement(); } };
};

const init = root => {
    for (const group of elements(root, '[data-design-system-segmented]')) {
        if (!controllers.has(group)) controllers.set(group, setupSegmented(group));
    }
    for (const chip of elements(root, '.design-system-chip')) {
        if (!controllers.has(chip)) {
            const controller = setupChip(chip);
            if (controller) controllers.set(chip, controller);
        }
    }
    for (const toggle of elements(root, '[data-design-system-toggle]')) {
        if (!toggle.closest('[data-design-system-segmented]') && !controllers.has(toggle)) controllers.set(toggle, setupToggle(toggle));
    }
};

const destroy = root => {
    for (const element of elements(root, '[data-design-system-segmented], .design-system-chip, [data-design-system-toggle]')) {
        controllers.get(element)?.abort();
        controllers.delete(element);
    }
};

export default { init, destroy };
