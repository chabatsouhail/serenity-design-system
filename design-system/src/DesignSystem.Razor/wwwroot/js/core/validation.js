let validationSequence = 0;

const ids = value => (value ?? '').split(/\s+/).filter(Boolean);

export const createProxyValidation = ({ root, control, proxy, component }) => {
    const initialDescription = proxy.getAttribute('aria-describedby');
    const initialInvalid = proxy.getAttribute('aria-invalid');
    const initialRootInvalid = root.dataset.designSystemInvalid;
    const baseDescription = [...new Set([
        ...ids(control.getAttribute('aria-describedby')),
        ...ids(initialDescription)
    ])].join(' ');
    let message = null;

    const describe = includeMessage => {
        const values = new Set(ids(baseDescription));
        if (includeMessage && message) values.add(message.id);
        if (values.size) proxy.setAttribute('aria-describedby', [...values].join(' '));
        else proxy.removeAttribute('aria-describedby');
    };

    const restoreInvalid = () => {
        const authoredInvalid = control.getAttribute('aria-invalid');
        if (authoredInvalid) proxy.setAttribute('aria-invalid', authoredInvalid);
        else if (initialInvalid) proxy.setAttribute('aria-invalid', initialInvalid);
        else proxy.removeAttribute('aria-invalid');
    };

    const show = () => {
        const text = control.validationMessage?.trim();
        if (text) {
            if (!message) {
                message = document.createElement('div');
                message.id = `design-system-${component}-validation-${++validationSequence}`;
                message.className = 'design-system-field-error';
                message.dataset.designSystemValidationMessage = '';
                message.setAttribute('role', 'alert');
                root.append(message);
            }
            message.textContent = text;
        }
        root.dataset.designSystemInvalid = 'true';
        proxy.setAttribute('aria-invalid', 'true');
        describe(Boolean(text));
    };

    const clear = () => {
        message?.remove();
        message = null;
        if (initialRootInvalid === undefined) delete root.dataset.designSystemInvalid;
        else root.dataset.designSystemInvalid = initialRootInvalid;
        restoreInvalid();
        describe(false);
    };

    describe(false);

    return {
        show,
        clear,
        abort() {
            message?.remove();
            message = null;
            if (initialDescription === null) proxy.removeAttribute('aria-describedby');
            else proxy.setAttribute('aria-describedby', initialDescription);
            if (initialInvalid === null) proxy.removeAttribute('aria-invalid');
            else proxy.setAttribute('aria-invalid', initialInvalid);
            if (initialRootInvalid === undefined) delete root.dataset.designSystemInvalid;
            else root.dataset.designSystemInvalid = initialRootInvalid;
        }
    };
};
