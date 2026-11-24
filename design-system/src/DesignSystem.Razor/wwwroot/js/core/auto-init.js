let observer = null;
let lifecycle = null;
let eventController = null;

const asRoot = value => value instanceof Document || value instanceof DocumentFragment || value instanceof Element ? value : document;

export const refresh = (root = document) => {
    if (!lifecycle) return;
    const target = asRoot(root);
    lifecycle.destroy(target);
    lifecycle.init(target);
};

export const startAutoInit = (registeredLifecycle, root = document.documentElement) => {
    if (observer) return;
    lifecycle = registeredLifecycle;
    observer = new MutationObserver(mutations => {
        const removed = new Set();
        const added = new Set();
        for (const mutation of mutations) {
            for (const node of mutation.removedNodes) if (node instanceof Element) removed.add(node);
            for (const node of mutation.addedNodes) if (node instanceof Element) added.add(node);
        }
        for (const node of removed) if (!node.isConnected) lifecycle.destroy(node);
        for (const node of added) if (node.isConnected) lifecycle.init(node);
    });
    observer.observe(root, { childList: true, subtree: true });

    eventController = new AbortController();
    document.addEventListener('design-system:contentupdated', event => {
        refresh(event.detail?.root ?? event.target);
    }, { signal: eventController.signal });
    document.addEventListener('htmx:afterSwap', event => lifecycle.init(asRoot(event.detail?.target ?? event.target)), { signal: eventController.signal });
    document.addEventListener('turbo:load', () => lifecycle.init(document), { signal: eventController.signal });
};

export const stopAutoInit = () => {
    observer?.disconnect();
    observer = null;
    eventController?.abort();
    eventController = null;
    lifecycle = null;
};
