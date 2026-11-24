import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';
import { positionAtPoint, positionFloating, resetFloating } from '../core/positioning.js?v=18.1.0';

const controllers = new WeakMap();
let activeMenu = null;
let menuSequence = 0;

const menuItems = menu => [...menu.querySelectorAll('[role^="menuitem"], .design-system-menu-item')]
    .filter(item => !item.hidden && !item.disabled && item.getAttribute('aria-disabled') !== 'true');

const resolveSurface = trigger => {
    const controlled = trigger.getAttribute('aria-controls')
        || trigger.dataset.designSystemMenuTrigger
        || trigger.dataset.designSystemContextMenu;
    if (controlled && controlled !== 'true') {
        const byId = document.getElementById(controlled);
        if (byId) return byId;
    }
    return trigger.closest('.design-system-menu-wrap')?.querySelector('.design-system-menu')
        ?? trigger.parentElement?.querySelector(':scope > .design-system-menu');
};

const nativePopoverOpen = menu => {
    if (!menu.hasAttribute('popover') || typeof menu.showPopover !== 'function') return false;
    try { return menu.matches(':popover-open'); } catch { return false; }
};
const surfaceOpen = menu => nativePopoverOpen(menu) || !menu.hidden;

const showSurface = menu => {
    menu.hidden = false;
    if (menu.hasAttribute('popover') && typeof menu.showPopover === 'function' && !nativePopoverOpen(menu)) {
        try { menu.showPopover(); } catch { /* The hidden-state fallback remains available. */ }
    }
};

const hideSurface = menu => {
    if (nativePopoverOpen(menu) && typeof menu.hidePopover === 'function') {
        try { menu.hidePopover(); } catch { /* The hidden attribute below is the fallback. */ }
    }
    menu.hidden = true;
};

const setup = (trigger, contextTarget = null) => {
    const menu = resolveSurface(trigger);
    if (!menu) return reportEnhancementFailure(contextTarget ?? trigger, contextTarget ? 'context-menu' : 'menu', 'menu surface');
    const controller = new AbortController();
    const { signal } = controller;
    const initialHidden = menu.hidden;
    const stateOwner = contextTarget ?? trigger;
    const restoreOwnerEnhancement = markEnhanced(stateOwner, contextTarget ? 'context-menu' : 'menu');
    const restoreSurfaceEnhancement = markEnhanced(menu, contextTarget ? 'context-menu' : 'menu');
    const originalControls = stateOwner.getAttribute('aria-controls');
    const originalHasPopup = stateOwner.getAttribute('aria-haspopup');
    const originalExpanded = stateOwner.getAttribute('aria-expanded');
    const generatedMenuId = !menu.id;
    const originalMenuRole = menu.getAttribute('role');
    const generatedItemRoles = [];
    if (generatedMenuId) menu.id = `design-system-menu-${++menuSequence}`;
    let point = null;
    let typeahead = '';
    let typeaheadTimer = 0;
    let opened = false;
    const addedContextTabIndex = Boolean(contextTarget && !contextTarget.hasAttribute('tabindex') && !contextTarget.matches('a[href], button, input, select, textarea, summary'));

    if (addedContextTabIndex) contextTarget.tabIndex = 0;

    if (!menu.hasAttribute('role')) menu.setAttribute('role', 'menu');
    for (const item of menu.querySelectorAll('.design-system-menu-item:not([role])')) {
        item.setAttribute('role', 'menuitem');
        generatedItemRoles.push(item);
    }

    const reposition = () => {
        if (!opened) return;
        if (point) positionAtPoint(menu, point.x, point.y);
        else positionFloating(trigger, menu, { alignment: menu.dataset.designSystemAlign ?? 'end' });
    };

    const close = (reason = 'dismiss', restoreFocus = false) => {
        if (!opened && !surfaceOpen(menu)) return;
        opened = false;
        hideSurface(menu);
        resetFloating(menu);
        stateOwner.setAttribute('aria-expanded', 'false');
        if (activeMenu?.menu === menu) activeMenu = null;
        const returnTarget = contextTarget ?? trigger;
        if (restoreFocus && returnTarget.isConnected) returnTarget.focus();
        emit(menu, 'close', { component: contextTarget ? 'context-menu' : 'menu', reason });
    };

    const focusItem = item => {
        if (!item) return;
        item.focus({ preventScroll: true });
        item.scrollIntoView({ block: 'nearest' });
    };

    const open = (focus = 'first', nextPoint = null) => {
        if (stateOwner.disabled || stateOwner.getAttribute('aria-disabled') === 'true') return;
        activeMenu?.close('another-menu', false);
        point = nextPoint;
        showSurface(menu);
        opened = true;
        stateOwner.setAttribute('aria-expanded', 'true');
        activeMenu = { menu, close };
        reposition();
        const items = menuItems(menu);
        requestAnimationFrame(() => focusItem(focus === 'last' ? items.at(-1) : items[0]));
        emit(menu, 'open', { component: contextTarget ? 'context-menu' : 'menu' });
    };

    const choose = item => {
        if (!item || item.disabled || item.getAttribute('aria-disabled') === 'true') return;
        const role = item.getAttribute('role');
        if (role === 'menuitemcheckbox') {
            item.setAttribute('aria-checked', item.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
        } else if (role === 'menuitemradio') {
            const group = item.dataset.designSystemGroup;
            for (const peer of menu.querySelectorAll('[role="menuitemradio"]')) {
                if (!group || peer.dataset.designSystemGroup === group) peer.setAttribute('aria-checked', peer === item ? 'true' : 'false');
            }
        }
        emit(menu, 'select', {
            value: item.dataset.designSystemValue ?? item.getAttribute('value') ?? '',
            checked: item.hasAttribute('aria-checked') ? item.getAttribute('aria-checked') === 'true' : undefined
        });
        if (item.dataset.designSystemKeepOpen !== 'true') close('selection', menu.contains(document.activeElement));
    };

    stateOwner.setAttribute('aria-controls', menu.id);
    stateOwner.setAttribute('aria-haspopup', 'menu');
    stateOwner.setAttribute('aria-expanded', 'false');
    hideSurface(menu);

    if (!contextTarget) {
        trigger.addEventListener('click', () => opened ? close('trigger', true) : open(), { signal });
        trigger.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!opened) open(event.key === 'ArrowUp' ? 'last' : 'first');
            }
        }, { signal });
    } else {
        if (contextTarget.matches('button, [role="button"]')) {
            contextTarget.addEventListener('click', event => {
                event.preventDefault();
                const rect = contextTarget.getBoundingClientRect();
                open('first', { x: rect.left, y: rect.bottom });
            }, { signal });
        }
        contextTarget.addEventListener('contextmenu', event => {
            event.preventDefault();
            open('first', { x: event.clientX, y: event.clientY });
        }, { signal });
        contextTarget.addEventListener('keydown', event => {
            if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
                event.preventDefault();
                const rect = contextTarget.getBoundingClientRect();
                open('first', { x: rect.left, y: rect.bottom });
            }
        }, { signal });
    }

    menu.addEventListener('click', event => {
        const item = event.target.closest?.('[role^="menuitem"], .design-system-menu-item');
        if (item && menu.contains(item)) choose(item);
    }, { signal });
    menu.addEventListener('keydown', event => {
        const items = menuItems(menu);
        const current = event.target.closest?.('[role^="menuitem"], .design-system-menu-item');
        if (event.key === 'Escape') {
            event.preventDefault();
            close('escape', true);
        } else if (event.key === 'Tab') {
            queueMicrotask(() => close('tab', false));
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const index = Math.max(0, items.indexOf(current));
            focusItem(event.key === 'ArrowDown' ? items[(index + 1) % items.length] : items[(index - 1 + items.length) % items.length]);
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            focusItem(event.key === 'Home' ? items[0] : items.at(-1));
        } else if ((event.key === 'Enter' || event.key === ' ') && current) {
            event.preventDefault();
            current.click();
        } else if (event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey) {
            window.clearTimeout(typeaheadTimer);
            typeahead += event.key.toLocaleLowerCase();
            const match = items.find(item => item.textContent.trim().toLocaleLowerCase().startsWith(typeahead));
            if (match) focusItem(match);
            typeaheadTimer = window.setTimeout(() => { typeahead = ''; }, 700);
        }
    }, { signal });
    menu.addEventListener('toggle', event => {
        if (event.newState === 'closed' && opened) close('native-dismiss', false);
    }, { signal });
    document.addEventListener('pointerdown', event => {
        if (opened && !menu.contains(event.target) && !trigger.contains(event.target) && !contextTarget?.contains(event.target)) close('outside', false);
    }, { capture: true, signal });
    window.addEventListener('resize', reposition, { signal });
    window.addEventListener('scroll', reposition, { capture: true, signal });

    return {
        abort() {
            close('destroy', false);
            controller.abort();
            window.clearTimeout(typeaheadTimer);
            if (addedContextTabIndex) contextTarget.removeAttribute('tabindex');
            if (originalControls === null) stateOwner.removeAttribute('aria-controls');
            else stateOwner.setAttribute('aria-controls', originalControls);
            if (originalHasPopup === null) stateOwner.removeAttribute('aria-haspopup');
            else stateOwner.setAttribute('aria-haspopup', originalHasPopup);
            if (originalExpanded === null) stateOwner.removeAttribute('aria-expanded');
            else stateOwner.setAttribute('aria-expanded', originalExpanded);
            if (generatedMenuId) menu.removeAttribute('id');
            if (originalMenuRole === null) menu.removeAttribute('role');
            else menu.setAttribute('role', originalMenuRole);
            for (const item of generatedItemRoles) item.removeAttribute('role');
            menu.hidden = initialHidden;
            resetFloating(menu);
            restoreSurfaceEnhancement();
            restoreOwnerEnhancement();
        }
    };
};

const resolveContextTrigger = target => {
    const id = target.dataset.designSystemContextMenu || target.getAttribute('aria-controls');
    const menu = id ? document.getElementById(id) : target.querySelector('.design-system-menu');
    if (!menu) return reportEnhancementFailure(target, 'context-menu', 'menu surface');
    return target;
};

const init = root => {
    for (const trigger of elements(root, '[data-design-system-menu-trigger]')) {
        if (!controllers.has(trigger)) {
            const controller = setup(trigger);
            if (controller) controllers.set(trigger, controller);
        }
    }
    for (const target of elements(root, '[data-design-system-context-menu]')) {
        if (controllers.has(target)) continue;
        const trigger = resolveContextTrigger(target);
        const controller = trigger ? setup(trigger, target) : null;
        if (controller) controllers.set(target, controller);
    }
};

const destroy = root => {
    for (const element of elements(root, '[data-design-system-menu-trigger], [data-design-system-context-menu]')) {
        controllers.get(element)?.abort();
        controllers.delete(element);
    }
};

export default { init, destroy };
