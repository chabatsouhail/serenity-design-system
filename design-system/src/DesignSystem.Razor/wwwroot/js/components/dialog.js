import { elements, focusable } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const surfaces = new WeakMap();
const triggerControllers = new WeakMap();
let activeModal = null;
let dialogSequence = 0;

const surfaceSelector = '[data-design-system-dialog], [data-design-system-drawer], [data-design-system-confirmation-dialog], dialog.design-system-dialog, dialog.design-system-drawer, .design-system-dialog[data-design-system-overlay], .design-system-drawer[data-design-system-overlay]';
const triggerSelector = '[data-design-system-dialog-trigger], [data-design-system-drawer-trigger], [data-design-system-confirmation-trigger], [data-design-system-overlay-trigger]';

const componentName = surface => surface.matches('[data-design-system-drawer], .design-system-drawer') ? 'drawer'
    : surface.matches('[data-design-system-confirmation-dialog]') ? 'confirmation-dialog'
        : 'dialog';

const setupSurface = surface => {
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(surface, componentName(surface));
    const { signal } = controller;
    const native = surface instanceof HTMLDialogElement;
    const initialHidden = surface.hidden;
    const initialOpen = native && surface.open;
    const initialOpenAttribute = surface.hasAttribute('open');
    const initialDataOpen = surface.getAttribute('data-design-system-open');
    const initialRole = surface.getAttribute('role');
    const initialAriaModal = surface.getAttribute('aria-modal');
    const initialTabIndex = surface.getAttribute('tabindex');
    const generatedId = !surface.id;
    if (generatedId) surface.id = `design-system-dialog-${++dialogSequence}`;
    let opened = initialOpen || (!surface.hidden && surface.dataset.designSystemOpen === 'true');
    let opener = null;
    let pendingClose = null;

    if (!native && !surface.hasAttribute('role')) surface.setAttribute('role', 'dialog');
    surface.setAttribute('aria-modal', 'true');

    const finishClose = (reason, returnValue, restoreFocus) => {
        opened = false;
        surface.hidden = true;
        if (!native) surface.removeAttribute('open');
        delete surface.dataset.designSystemOpen;
        if (activeModal?.surface === surface) activeModal = null;
        const returnTarget = opener;
        opener = null;
        if (returnTarget?.matches?.(triggerSelector)) returnTarget.setAttribute('aria-expanded', 'false');
        if (restoreFocus && returnTarget?.isConnected) returnTarget.focus();
        emit(surface, 'close', { component: componentName(surface), reason, returnValue: returnValue ?? '' });
    };

    const close = (reason = 'dismiss', returnValue = '', restoreFocus = true) => {
        if (!opened && !(native && surface.open)) return;
        if (native && surface.open) {
            pendingClose = { reason, returnValue, restoreFocus };
            surface.close(String(returnValue ?? ''));
            if (opened) {
                const detail = pendingClose;
                pendingClose = null;
                finishClose(detail.reason, detail.returnValue, detail.restoreFocus);
            }
        } else {
            finishClose(reason, returnValue, restoreFocus);
        }
    };

    const open = nextOpener => {
        if (opened || (native && surface.open)) return;
        activeModal?.close('another-dialog', '', false);
        opener = nextOpener instanceof HTMLElement ? nextOpener : document.activeElement;
        if (opener?.matches?.(triggerSelector)) opener.setAttribute('aria-expanded', 'true');
        surface.hidden = false;
        surface.dataset.designSystemOpen = 'true';
        if (native && typeof surface.showModal === 'function') {
            try { surface.showModal(); } catch { surface.setAttribute('open', ''); }
        } else if (native) {
            surface.setAttribute('open', '');
        } else {
            surface.setAttribute('open', '');
        }
        opened = true;
        activeModal = { surface, close };
        const initial = surface.querySelector('[data-design-system-initial-focus], [autofocus]') ?? focusable(surface)[0] ?? surface;
        if (!surface.hasAttribute('tabindex') && initial === surface) surface.tabIndex = -1;
        requestAnimationFrame(() => initial.focus({ preventScroll: true }));
        emit(surface, 'open', { component: componentName(surface) });
    };

    surface.addEventListener('cancel', event => {
        if (surface.dataset.designSystemDismissible === 'false') {
            event.preventDefault();
            return;
        }
        event.preventDefault();
        close('escape');
    }, { signal });
    surface.addEventListener('close', () => {
        if (!opened && surface.dataset.designSystemOpen !== 'true') {
            pendingClose = null;
            return;
        }
        const detail = pendingClose ?? { reason: 'native-close', returnValue: surface.returnValue, restoreFocus: true };
        pendingClose = null;
        finishClose(detail.reason, detail.returnValue, detail.restoreFocus);
    }, { signal });
    surface.addEventListener('click', event => {
        const confirm = event.target.closest?.('[data-design-system-confirm]');
        if (confirm && surface.contains(confirm)) {
            const value = confirm.dataset.designSystemValue ?? confirm.value ?? 'confirm';
            if (emit(surface, 'confirm', { value }, { cancelable: true })) close('confirm', value);
            return;
        }
        const closer = event.target.closest?.('[data-design-system-dialog-close], [data-design-system-drawer-close], [data-design-system-overlay-close], [data-design-system-cancel]');
        if (closer && surface.contains(closer)) {
            close(closer.hasAttribute('data-design-system-cancel') ? 'cancel' : 'close-button', closer.dataset.designSystemValue ?? closer.value ?? '');
            return;
        }
        if (event.target === surface && surface.dataset.designSystemDismissible !== 'false') {
            if (!native) close('backdrop');
            else {
                const rect = surface.getBoundingClientRect();
                const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
                if (outside) close('backdrop');
            }
        }
    }, { signal });
    surface.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !native) {
            if (surface.dataset.designSystemDismissible !== 'false') {
                event.preventDefault();
                close('escape');
            }
            return;
        }
        if (event.key !== 'Tab') return;
        const available = focusable(surface);
        if (!available.length) {
            event.preventDefault();
            surface.focus();
            return;
        }
        const first = available[0];
        const last = available.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }, { signal });

    if (!initialOpen && surface.dataset.designSystemOpen !== 'true') surface.hidden = true;

    return {
        open,
        close,
        abort() {
            if (native && surface.open) {
                try { surface.close(); } catch { surface.removeAttribute('open'); }
            }
            controller.abort();
            if (activeModal?.surface === surface) activeModal = null;
            if (opener?.matches?.(triggerSelector)) opener.setAttribute('aria-expanded', 'false');
            opener = null;
            pendingClose = null;
            opened = false;
            surface.hidden = initialHidden;
            if (initialOpenAttribute) surface.setAttribute('open', '');
            else surface.removeAttribute('open');
            if (initialDataOpen === null) delete surface.dataset.designSystemOpen;
            else surface.setAttribute('data-design-system-open', initialDataOpen);
            if (initialRole === null) surface.removeAttribute('role');
            else surface.setAttribute('role', initialRole);
            if (initialAriaModal === null) surface.removeAttribute('aria-modal');
            else surface.setAttribute('aria-modal', initialAriaModal);
            if (initialTabIndex === null) surface.removeAttribute('tabindex');
            else surface.setAttribute('tabindex', initialTabIndex);
            if (generatedId) surface.removeAttribute('id');
            restoreEnhancement();
        }
    };
};

const managerFor = surface => {
    let manager = surfaces.get(surface);
    if (!manager) {
        manager = setupSurface(surface);
        surfaces.set(surface, manager);
    }
    return manager;
};

const resolveSurface = trigger => {
    const id = trigger.getAttribute('aria-controls')
        || trigger.dataset.designSystemDialogTrigger
        || trigger.dataset.designSystemDrawerTrigger
        || trigger.dataset.designSystemConfirmationTrigger
        || trigger.dataset.designSystemOverlayTrigger;
    if (id && id !== 'true') return document.getElementById(id);
    const selector = trigger.hasAttribute('data-design-system-drawer-trigger') ? '[data-design-system-drawer], .design-system-drawer' : '[data-design-system-dialog], .design-system-dialog';
    return trigger.parentElement?.querySelector(selector);
};

const setupTrigger = trigger => {
    const surface = resolveSurface(trigger);
    if (!surface) return reportEnhancementFailure(trigger, 'dialog-trigger', 'dialog or drawer surface');
    const manager = managerFor(surface);
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(trigger, componentName(surface));
    const originalControls = trigger.getAttribute('aria-controls');
    const originalHasPopup = trigger.getAttribute('aria-haspopup');
    const originalExpanded = trigger.getAttribute('aria-expanded');
    trigger.setAttribute('aria-controls', surface.id);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', event => {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        event.preventDefault();
        manager.open(trigger);
    }, { signal: controller.signal });
    return {
        abort() {
            controller.abort();
            if (originalControls === null) trigger.removeAttribute('aria-controls');
            else trigger.setAttribute('aria-controls', originalControls);
            if (originalHasPopup === null) trigger.removeAttribute('aria-haspopup');
            else trigger.setAttribute('aria-haspopup', originalHasPopup);
            if (originalExpanded === null) trigger.removeAttribute('aria-expanded');
            else trigger.setAttribute('aria-expanded', originalExpanded);
            restoreEnhancement();
        }
    };
};

export const openDialog = (target, opener = document.activeElement) => {
    const surface = typeof target === 'string' ? document.getElementById(target) : target;
    if (!surface?.matches?.(surfaceSelector)) return false;
    managerFor(surface).open(opener);
    return true;
};

export const closeDialog = (target, returnValue = '') => {
    const surface = typeof target === 'string' ? document.getElementById(target) : target;
    const manager = surface ? surfaces.get(surface) : null;
    if (!manager) return false;
    manager.close('api', returnValue);
    return true;
};

const init = root => {
    for (const surface of elements(root, surfaceSelector)) managerFor(surface);
    for (const trigger of elements(root, triggerSelector)) {
        if (!triggerControllers.has(trigger)) {
            const controller = setupTrigger(trigger);
            if (controller) triggerControllers.set(trigger, controller);
        }
    }
};

const destroy = root => {
    for (const surface of elements(root, surfaceSelector)) {
        surfaces.get(surface)?.abort();
        surfaces.delete(surface);
    }
    for (const trigger of elements(root, triggerSelector)) {
        triggerControllers.get(trigger)?.abort();
        triggerControllers.delete(trigger);
    }
};

export default { init, destroy };
