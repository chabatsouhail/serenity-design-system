import { elements, focusable } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';
import { positionFloating, resetFloating } from '../core/positioning.js?v=18.1.0';

const popoverControllers = new WeakMap();
const tooltipControllers = new WeakMap();
let activePopover = null;
let popoverSequence = 0;
let tooltipSequence = 0;

const nativePopoverOpen = surface => {
    if (!surface.hasAttribute('popover') || typeof surface.showPopover !== 'function') return false;
    try { return surface.matches(':popover-open'); } catch { return false; }
};

const resolveControlled = (trigger, dataName, fallbackSelector) => {
    const id = trigger.getAttribute('aria-controls') || trigger.dataset[dataName];
    if (id && id !== 'true') {
        const controlled = document.getElementById(id);
        if (controlled) return controlled;
    }
    return trigger.closest('.design-system-popover-wrap')?.querySelector(fallbackSelector)
        ?? trigger.parentElement?.querySelector(`:scope > ${fallbackSelector}`);
};

const showSurface = surface => {
    surface.hidden = false;
    if (surface.hasAttribute('popover') && typeof surface.showPopover === 'function' && !nativePopoverOpen(surface)) {
        try { surface.showPopover(); } catch { /* hidden-state fallback */ }
    }
};

const hideSurface = surface => {
    if (nativePopoverOpen(surface) && typeof surface.hidePopover === 'function') {
        try { surface.hidePopover(); } catch { /* hidden-state fallback */ }
    }
    surface.hidden = true;
};

const setupPopover = trigger => {
    const surface = resolveControlled(trigger, 'designSystemPopoverTrigger', '[data-design-system-popover], .design-system-popover');
    if (!surface) return reportEnhancementFailure(trigger, 'popover', 'popover surface');
    const controller = new AbortController();
    const restoreTriggerEnhancement = markEnhanced(trigger, 'popover');
    const restoreSurfaceEnhancement = markEnhanced(surface, 'popover');
    const { signal } = controller;
    const initialHidden = surface.hidden;
    const originalControls = trigger.getAttribute('aria-controls');
    const originalHasPopup = trigger.getAttribute('aria-haspopup');
    const originalExpanded = trigger.getAttribute('aria-expanded');
    const generatedSurfaceId = !surface.id;
    if (generatedSurfaceId) surface.id = `design-system-popover-${++popoverSequence}`;
    let opened = false;

    const reposition = () => {
        if (opened) positionFloating(trigger, surface, { alignment: surface.dataset.designSystemAlign ?? 'end' });
    };
    const close = (reason = 'dismiss', restoreFocus = false) => {
        if (!opened && surface.hidden) return;
        opened = false;
        hideSurface(surface);
        resetFloating(surface);
        trigger.setAttribute('aria-expanded', 'false');
        if (activePopover?.surface === surface) activePopover = null;
        if (restoreFocus && trigger.isConnected) trigger.focus();
        emit(surface, 'close', { component: 'popover', reason });
    };
    const open = () => {
        if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true' || opened) return;
        activePopover?.close('another-popover', false);
        showSurface(surface);
        opened = true;
        trigger.setAttribute('aria-expanded', 'true');
        activePopover = { surface, close };
        reposition();
        if (trigger.dataset.designSystemPopoverFocus === 'true') {
            requestAnimationFrame(() => (surface.querySelector('[data-design-system-initial-focus]') ?? focusable(surface)[0])?.focus({ preventScroll: true }));
        }
        emit(surface, 'open', { component: 'popover' });
    };

    const popupRole = surface.getAttribute('role');
    if (!originalHasPopup && ['menu', 'listbox', 'tree', 'grid', 'dialog'].includes(popupRole)) {
        trigger.setAttribute('aria-haspopup', popupRole);
    }
    trigger.setAttribute('aria-controls', surface.id);
    trigger.setAttribute('aria-expanded', 'false');
    hideSurface(surface);
    trigger.addEventListener('click', () => opened ? close('trigger', true) : open(), { signal });
    trigger.addEventListener('keydown', event => {
        if ((event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') && !opened) {
            event.preventDefault();
            open();
        }
    }, { signal });
    document.addEventListener('keydown', event => {
        if (opened && event.key === 'Escape') {
            event.preventDefault();
            close('escape', true);
        }
    }, { signal });
    document.addEventListener('pointerdown', event => {
        if (opened && !surface.contains(event.target) && !trigger.contains(event.target)) close('outside', false);
    }, { capture: true, signal });
    document.addEventListener('focusin', event => {
        if (opened && !surface.contains(event.target) && !trigger.contains(event.target)) close('focusout', false);
    }, { signal });
    surface.addEventListener('toggle', event => {
        if (event.newState === 'closed' && opened) close('native-dismiss', false);
    }, { signal });
    for (const closeButton of surface.querySelectorAll('[data-design-system-popover-close]')) {
        closeButton.addEventListener('click', () => close('close-button', true), { signal });
    }
    window.addEventListener('resize', reposition, { signal });
    window.addEventListener('scroll', reposition, { capture: true, signal });

    return {
        abort() {
            close('destroy', false);
            controller.abort();
            surface.hidden = initialHidden;
            resetFloating(surface);
            if (originalControls === null) trigger.removeAttribute('aria-controls');
            else trigger.setAttribute('aria-controls', originalControls);
            if (originalHasPopup === null) trigger.removeAttribute('aria-haspopup');
            else trigger.setAttribute('aria-haspopup', originalHasPopup);
            if (originalExpanded === null) trigger.removeAttribute('aria-expanded');
            else trigger.setAttribute('aria-expanded', originalExpanded);
            if (generatedSurfaceId) surface.removeAttribute('id');
            restoreSurfaceEnhancement();
            restoreTriggerEnhancement();
        }
    };
};

const tooltipText = trigger => {
    const explicit = trigger.dataset.designSystemTooltip || trigger.dataset.designSystemThemeTooltip;
    return explicit || trigger.getAttribute('aria-label') || trigger.getAttribute('title') || '';
};

const setupTooltip = trigger => {
    const fallbackText = tooltipText(trigger);
    const describedTooltipId = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/)
        .find(id => document.getElementById(id)?.matches('.design-system-tooltip, [role="tooltip"]'));
    const controlledId = trigger.dataset.designSystemTooltipTrigger || describedTooltipId;
    let surface = controlledId ? document.getElementById(controlledId) : null;
    let generated = false;
    if (!surface) {
        const text = fallbackText;
        if (!text) return reportEnhancementFailure(trigger, 'tooltip', 'tooltip text or surface');
        surface = document.createElement('div');
        surface.id = `design-system-tooltip-${++tooltipSequence}`;
        surface.className = 'design-system-tooltip';
        surface.setAttribute('role', 'tooltip');
        surface.textContent = text;
        surface.hidden = true;
        document.body.append(surface);
        generated = true;
    }

    const controller = new AbortController();
    const restoreTriggerEnhancement = markEnhanced(trigger, 'tooltip');
    const restoreSurfaceEnhancement = markEnhanced(surface, 'tooltip');
    const { signal } = controller;
    const initialHidden = surface.hidden;
    const originalDescription = trigger.getAttribute('aria-describedby');
    const originalTitle = trigger.getAttribute('title');
    let open = false;
    let hideTimer = 0;
    let triggerHovered = false;
    let triggerFocused = false;
    let surfaceHovered = false;

    surface.hidden = true;

    const cancelHide = () => {
        if (!hideTimer) return;
        window.clearTimeout(hideTimer);
        hideTimer = 0;
    };

    const reposition = () => {
        if (open) positionFloating(trigger, surface, { alignment: 'start', gap: 8 });
    };
    const show = source => {
        cancelHide();
        if (open || trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') return;
        if (generated) surface.textContent = tooltipText(trigger) || fallbackText;
        if (!surface.textContent?.trim()) return;
        surface.hidden = false;
        open = true;
        const ids = new Set((originalDescription ?? '').split(/\s+/).filter(Boolean));
        ids.add(surface.id);
        trigger.setAttribute('aria-describedby', [...ids].join(' '));
        reposition();
        emit(trigger, 'tooltipopen', { source });
    };
    const hide = reason => {
        cancelHide();
        if (!open) return;
        open = false;
        surface.hidden = true;
        resetFloating(surface);
        if (originalDescription) trigger.setAttribute('aria-describedby', originalDescription);
        else trigger.removeAttribute('aria-describedby');
        emit(trigger, 'tooltipclose', { reason });
    };
    const scheduleHide = reason => {
        cancelHide();
        hideTimer = window.setTimeout(() => {
            hideTimer = 0;
            if (!triggerHovered && !triggerFocused && !surfaceHovered) hide(reason);
        }, 120);
    };

    if (originalTitle) trigger.removeAttribute('title');
    trigger.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') {
            triggerHovered = true;
            show('pointer');
        }
    }, { signal });
    trigger.addEventListener('pointerleave', () => {
        triggerHovered = false;
        scheduleHide('pointerleave');
    }, { signal });
    trigger.addEventListener('focus', () => {
        triggerFocused = true;
        show('focus');
    }, { signal });
    trigger.addEventListener('blur', () => {
        triggerFocused = false;
        scheduleHide('blur');
    }, { signal });
    trigger.addEventListener('keydown', event => {
        if (event.key === 'Escape') hide('escape');
    }, { signal });
    surface.addEventListener('pointerenter', () => {
        surfaceHovered = true;
        cancelHide();
    }, { signal });
    surface.addEventListener('pointerleave', () => {
        surfaceHovered = false;
        scheduleHide('surface-pointerleave');
    }, { signal });
    window.addEventListener('resize', reposition, { signal });
    window.addEventListener('scroll', reposition, { capture: true, signal });

    return {
        abort() {
            hide('destroy');
            cancelHide();
            controller.abort();
            if (originalTitle) trigger.setAttribute('title', originalTitle);
            if (generated) surface.remove();
            else surface.hidden = initialHidden;
            restoreSurfaceEnhancement();
            restoreTriggerEnhancement();
        }
    };
};

const init = root => {
    for (const trigger of elements(root, '[data-design-system-popover-trigger]')) {
        if (!popoverControllers.has(trigger)) {
            const controller = setupPopover(trigger);
            if (controller) popoverControllers.set(trigger, controller);
        }
    }
    for (const trigger of elements(root, '[data-design-system-tooltip-trigger], [data-design-system-tooltip], [data-design-system-theme-tooltip]')) {
        if (!tooltipControllers.has(trigger)) {
            const controller = setupTooltip(trigger);
            if (controller) tooltipControllers.set(trigger, controller);
        }
    }
};

const destroy = root => {
    for (const trigger of elements(root, '[data-design-system-popover-trigger]')) {
        popoverControllers.get(trigger)?.abort();
        popoverControllers.delete(trigger);
    }
    for (const trigger of elements(root, '[data-design-system-tooltip-trigger], [data-design-system-tooltip], [data-design-system-theme-tooltip]')) {
        tooltipControllers.get(trigger)?.abort();
        tooltipControllers.delete(trigger);
    }
};

export default { init, destroy };
