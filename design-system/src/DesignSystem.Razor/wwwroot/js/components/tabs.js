import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const controllers = new WeakMap();

const setup = root => {
    const tabs = [...root.querySelectorAll('[role="tab"]')]
        .filter(tab => tab.closest('.design-system-tabs') === root);
    if (!tabs.length) return reportEnhancementFailure(root, 'tabs', 'tabs');
    const panels = new Map();
    for (const tab of tabs) {
        const panelId = tab.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel || !root.contains(panel)) return reportEnhancementFailure(root, 'tabs', `panel for ${tab.id || 'tab'}`);
        panels.set(tab, panel);
    }
    const isEnabled = tab => tab.getAttribute('aria-disabled') !== 'true' && !tab.disabled;
    const enabled = () => tabs.filter(isEnabled);
    if (!enabled().length) return reportEnhancementFailure(root, 'tabs', 'enabled tab');
    const controller = new AbortController();
    const select = (tab, focus = false, notify = true) => {
        if (!tab || !isEnabled(tab)) return;
        for (const item of tabs) {
            const selected = item === tab;
            item.setAttribute('aria-selected', selected ? 'true' : 'false');
            item.tabIndex = selected ? 0 : -1;
            panels.get(item).hidden = !selected;
        }
        if (focus) tab.focus();
        if (notify) emit(root, 'change', { value: tab.dataset.designSystemValue ?? tab.id ?? '' });
    };
    const move = (current, delta) => {
        const available = enabled();
        const index = available.indexOf(current);
        select(available[(index + delta + available.length) % available.length], true);
    };
    root.addEventListener('click', event => {
        const tab = event.target.closest('[role="tab"]');
        if (tabs.includes(tab)) select(tab);
    }, { signal: controller.signal });
    root.addEventListener('keydown', event => {
        const tab = event.target.closest('[role="tab"]');
        if (!tabs.includes(tab)) return;
        const vertical = root.querySelector('[role="tablist"]')?.getAttribute('aria-orientation') === 'vertical';
        if ((!vertical && event.key === 'ArrowRight') || (vertical && event.key === 'ArrowDown')) move(tab, 1);
        else if ((!vertical && event.key === 'ArrowLeft') || (vertical && event.key === 'ArrowUp')) move(tab, -1);
        else if (event.key === 'Home') select(enabled()[0], true);
        else if (event.key === 'End') select(enabled().at(-1), true);
        else return;
        event.preventDefault();
    }, { signal: controller.signal });
    const initial = tabs.find(tab => tab.getAttribute('aria-selected') === 'true' && isEnabled(tab)) ?? enabled()[0];
    const restoreEnhancement = markEnhanced(root, 'tabs');
    select(initial, false, false);
    return {
        abort() {
            controller.abort();
            restoreEnhancement();
            for (const panel of panels.values()) panel.hidden = false;
        }
    };
};

const init = root => {
    for (const tabs of elements(root, '.design-system-tabs')) {
        if (controllers.has(tabs)) continue;
        const controller = setup(tabs);
        if (controller) controllers.set(tabs, controller);
    }
};

const destroy = root => {
    for (const tabs of elements(root, '.design-system-tabs')) {
        controllers.get(tabs)?.abort();
        controllers.delete(tabs);
    }
};

export default { init, destroy };
