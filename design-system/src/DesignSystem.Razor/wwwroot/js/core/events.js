export const emit = (target, name, detail = {}, options = {}) => target.dispatchEvent(new CustomEvent(`design-system:${name}`, {
    bubbles: options.bubbles ?? true,
    cancelable: options.cancelable ?? false,
    composed: options.composed ?? false,
    detail
}));
