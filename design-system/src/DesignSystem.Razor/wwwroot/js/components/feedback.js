import { elements, focusable } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const toastControllers = new WeakMap();
const alertControllers = new WeakMap();
const busyControllers = new WeakMap();
let toastSequence = 0;

const safeFocusAfterRemoval = element => {
    if (!element.contains(document.activeElement)) return null;
    const available = focusable(document).filter(item => !element.contains(item));
    const rect = element.getBoundingClientRect();
    return available.find(item => item.getBoundingClientRect().top >= rect.top) ?? available.at(-1) ?? null;
};

const setupToast = (toast, configuredDuration) => {
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(toast, 'toast');
    const dismissButton = toast.querySelector('[data-design-system-toast-dismiss], .design-system-toast__dismiss');
    const restoreDismissEnhancement = dismissButton ? markEnhanced(dismissButton, 'toast-dismiss') : () => {};
    const { signal } = controller;
    const duration = Number.isFinite(configuredDuration) ? Math.max(0, configuredDuration)
        : Math.max(0, Number(toast.dataset.designSystemDuration ?? 5000));
    let timer = 0;
    let remaining = duration;
    let startedAt = 0;
    let dismissed = false;

    const stop = () => {
        if (!timer) return;
        window.clearTimeout(timer);
        timer = 0;
        remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };
    const dismiss = (reason = 'dismiss') => {
        if (dismissed) return false;
        if (!emit(toast, 'dismiss', { component: 'toast', reason }, { cancelable: true })) return false;
        dismissed = true;
        stop();
        const focusTarget = safeFocusAfterRemoval(toast);
        restoreDismissEnhancement();
        restoreEnhancement();
        controller.abort();
        toastControllers.delete(toast);
        if (toast.dataset.designSystemDismissAction === 'hide') toast.hidden = true;
        else toast.remove();
        focusTarget?.focus();
        return true;
    };
    const start = () => {
        if (!duration || timer || dismissed || remaining <= 0 || document.hidden || toast.matches(':hover, :focus-within')) return;
        startedAt = performance.now();
        timer = window.setTimeout(() => dismiss('timeout'), remaining);
    };

    dismissButton?.addEventListener('click', () => dismiss('button'), { signal });
    toast.addEventListener('pointerenter', stop, { signal });
    toast.addEventListener('pointerleave', start, { signal });
    toast.addEventListener('focusin', stop, { signal });
    toast.addEventListener('focusout', event => {
        if (!toast.contains(event.relatedTarget)) start();
    }, { signal });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start(), { signal });
    start();

    return { abort: () => { stop(); controller.abort(); restoreDismissEnhancement(); restoreEnhancement(); }, dismiss };
};

const setupAlert = alert => {
    const dismissButton = alert.querySelector('[data-design-system-alert-dismiss]');
    if (!dismissButton) return null;
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(alert, 'alert');
    const restoreDismissEnhancement = markEnhanced(dismissButton, 'alert-dismiss');
    dismissButton.addEventListener('click', () => {
        if (!emit(alert, 'dismiss', { component: 'alert', reason: 'button' }, { cancelable: true })) return;
        const focusTarget = safeFocusAfterRemoval(alert);
        restoreDismissEnhancement();
        restoreEnhancement();
        controller.abort();
        alertControllers.delete(alert);
        if (alert.dataset.designSystemDismissAction === 'hide') alert.hidden = true;
        else alert.remove();
        focusTarget?.focus();
    }, { signal: controller.signal });
    return { abort() { controller.abort(); restoreDismissEnhancement(); restoreEnhancement(); } };
};

const setupBusyRegion = region => {
    if (!region.querySelector('[data-design-system-busy-content]')) return reportEnhancementFailure(region, 'busy-region', 'busy content');
    const restoreEnhancement = markEnhanced(region, 'busy-region');
    const initialStates = new Map();
    const sync = () => {
        for (const [content, initiallyInert] of initialStates) {
            if (!region.contains(content)) {
                content.toggleAttribute('inert', initiallyInert);
                initialStates.delete(content);
            }
        }
        const busy = region.getAttribute('aria-busy') === 'true';
        for (const content of region.querySelectorAll('[data-design-system-busy-content]')) {
            if (!initialStates.has(content)) initialStates.set(content, content.hasAttribute('inert'));
            content.toggleAttribute('inert', busy);
        }
    };
    const observer = new MutationObserver(sync);
    observer.observe(region, { attributes: true, attributeFilter: ['aria-busy'], childList: true, subtree: true });
    sync();
    return {
        abort() {
            observer.disconnect();
            for (const [content, initiallyInert] of initialStates) content.toggleAttribute('inert', initiallyInert);
            initialStates.clear();
            restoreEnhancement();
        }
    };
};

const resolveHost = host => {
    if (host instanceof Element) return host;
    if (typeof host === 'string') return document.querySelector(host) ?? document.getElementById(host);
    return document.querySelector('[data-design-system-toast-host]');
};

export const showToast = options => {
    const settings = typeof options === 'string' ? { message: options } : (options ?? {});
    const host = resolveHost(settings.host);
    if (!host) throw new Error('A [data-design-system-toast-host] element is required before showing a toast.');
    if (!settings.message && !settings.title) throw new TypeError('A toast requires a title or message.');

    const toast = document.createElement('article');
    toast.id = settings.id || `design-system-toast-${++toastSequence}`;
    toast.className = 'design-system-toast';
    toast.dataset.designSystemToast = '';
    toast.dataset.designSystemTone = settings.tone || 'neutral';
    if (settings.duration !== undefined) toast.dataset.designSystemDuration = String(settings.duration);

    const content = document.createElement('div');
    content.className = 'design-system-toast__content';
    if (settings.title) {
        const title = document.createElement('div');
        title.className = 'design-system-toast__title';
        title.textContent = settings.title;
        content.append(title);
    }
    if (settings.message) {
        const message = document.createElement('div');
        message.className = 'design-system-toast__message';
        message.textContent = settings.message;
        content.append(message);
    }
    toast.append(content);

    if (settings.dismissible !== false) {
        const dismiss = document.createElement('button');
        dismiss.type = 'button';
        dismiss.className = 'design-system-toast__dismiss';
        dismiss.dataset.designSystemToastDismiss = '';
        dismiss.dataset.designSystemJsOnly = '';
        dismiss.setAttribute('aria-label', settings.dismissLabel || 'Dismiss notification');
        const icon = document.createElement('span');
        icon.className = 'design-system-icon design-system-icon--small';
        icon.dataset.designSystemIcon = 'x';
        icon.setAttribute('aria-hidden', 'true');
        dismiss.append(icon);
        toast.append(dismiss);
    }

    host.append(toast);
    const controller = setupToast(toast, Number(settings.duration));
    toastControllers.set(toast, controller);
    emit(toast, 'show', { component: 'toast', id: toast.id, tone: toast.dataset.designSystemTone });
    return toast;
};

export const dismissToast = (target, reason = 'api') => {
    const toast = typeof target === 'string' ? document.getElementById(target) : target;
    return toastControllers.get(toast)?.dismiss(reason) ?? false;
};

const init = root => {
    for (const toast of elements(root, '[data-design-system-toast], .design-system-toast')) {
        if (!toastControllers.has(toast)) toastControllers.set(toast, setupToast(toast));
    }
    for (const alert of elements(root, '[data-design-system-alert], .design-system-alert')) {
        if (!alertControllers.has(alert)) {
            const controller = setupAlert(alert);
            if (controller) alertControllers.set(alert, controller);
        }
    }
    for (const region of elements(root, '[data-design-system-busy-region]')) {
        if (!busyControllers.has(region)) {
            const controller = setupBusyRegion(region);
            if (controller) busyControllers.set(region, controller);
        }
    }
};

const destroy = root => {
    for (const toast of elements(root, '[data-design-system-toast], .design-system-toast')) {
        toastControllers.get(toast)?.abort();
        toastControllers.delete(toast);
    }
    for (const alert of elements(root, '[data-design-system-alert], .design-system-alert')) {
        alertControllers.get(alert)?.abort();
        alertControllers.delete(alert);
    }
    for (const region of elements(root, '[data-design-system-busy-region]')) {
        busyControllers.get(region)?.abort();
        busyControllers.delete(region);
    }
};

export default { init, destroy };
