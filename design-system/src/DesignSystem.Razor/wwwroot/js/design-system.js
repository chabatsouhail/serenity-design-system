import { register, init, destroy } from './core/lifecycle.js?v=18.1.0';
import { refresh, startAutoInit } from './core/auto-init.js?v=18.1.0';
import theme, { applyTheme, themePreference } from './components/theme.js?v=18.1.0';
import forms from './components/forms.js?v=18.1.0';
import picker from './components/picker.js?v=18.1.0';
import datePicker from './components/date-picker.js?v=18.1.0';
import tabs from './components/tabs.js?v=18.1.0';
import selection from './components/selection.js?v=18.1.0';
import menu from './components/menu.js?v=18.1.0';
import floating from './components/floating.js?v=18.1.0';
import dialog, { closeDialog, openDialog } from './components/dialog.js?v=18.1.0';
import table from './components/table.js?v=18.1.0';
import feedback, { dismissToast, showToast } from './components/feedback.js?v=18.1.0';
import navigation from './components/navigation.js?v=18.1.0';

const VERSION = '18.1.0';
const runtimeRoot = document.documentElement;
runtimeRoot.dataset.designSystemRuntime = 'loading';

register(theme);
register(forms);
register(picker);
register(datePicker);
register(tabs);
register(selection);
register(menu);
register(floating);
register(dialog);
register(table);
register(feedback);
register(navigation);

const api = Object.freeze({
    version: VERSION,
    init,
    destroy,
    refresh,
    theme: Object.freeze({ apply: applyTheme, preference: themePreference }),
    dialog: Object.freeze({ open: openDialog, close: closeDialog }),
    toast: Object.freeze({ show: showToast, dismiss: dismissToast })
});

if (!window.DesignSystem) {
    Object.defineProperty(window, 'DesignSystem', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: api
    });
}

const ready = () => {
    try {
        init(document);
        startAutoInit({ init, destroy });
        runtimeRoot.dataset.designSystemRuntime = 'ready';
        document.dispatchEvent(new CustomEvent('design-system:ready', { bubbles: true, detail: { version: VERSION } }));
    } catch (error) {
        runtimeRoot.dataset.designSystemRuntime = 'failed';
        document.dispatchEvent(new CustomEvent('design-system:runtimeerror', {
            bubbles: true,
            detail: { reason: 'initialization', error }
        }));
        console.error('The design system failed to initialize.', error);
        throw error;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
} else {
    ready();
}

export { VERSION, init, destroy, refresh };
