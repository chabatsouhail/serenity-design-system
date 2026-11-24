import { emit } from './events.js?v=18.1.0';

const restoreAttribute = (element, name, initial) => {
    if (initial === null) element.removeAttribute(name);
    else element.setAttribute(name, initial);
};

export const markEnhanced = (element, component) => {
    const initialEnhanced = element.getAttribute('data-design-system-enhanced');
    const initialError = element.getAttribute('data-design-system-enhancement-error');
    element.dataset.designSystemEnhanced = 'true';
    element.removeAttribute('data-design-system-enhancement-error');
    emit(element, 'enhanced', { component });
    return () => {
        restoreAttribute(element, 'data-design-system-enhanced', initialEnhanced);
        restoreAttribute(element, 'data-design-system-enhancement-error', initialError);
    };
};

export const reportEnhancementFailure = (element, component, missing) => {
    const parts = Array.isArray(missing) ? missing : [missing];
    const detail = { component, missing: parts };
    const signature = parts.join(' ');
    if (element.dataset.designSystemEnhancementError !== signature) {
        element.dataset.designSystemEnhancementError = signature;
        console.warn(`The design system could not enhance ${component}; missing or invalid: ${parts.join(', ')}.`, element);
        emit(element, 'enhancementerror', detail);
    }
    return null;
};
