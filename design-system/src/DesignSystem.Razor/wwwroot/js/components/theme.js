import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const STORAGE_KEY = 'design-system-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');
const controllers = new WeakMap();
let preference = 'system';

const normalize = value => ['light', 'dark', 'system'].includes(value) ? value : 'system';
const resolved = value => value === 'system' ? (media.matches ? 'dark' : 'light') : value;
const storedPreference = () => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const syncToggle = toggle => {
    const current = resolved(preference);
    toggle.setAttribute('aria-checked', current === 'dark' ? 'true' : 'false');
    toggle.removeAttribute('aria-pressed');
    for (const icon of toggle.querySelectorAll('[data-design-system-theme-icon]')) {
        const iconTheme = icon.dataset.designSystemThemeIcon;
        icon.hidden = Boolean(iconTheme) && iconTheme !== (current === 'dark' ? 'sun' : 'moon');
    }
};

const syncAll = () => elements(document, '[data-design-system-theme-toggle]').forEach(syncToggle);

export const applyTheme = (nextPreference, persist = true) => {
    preference = normalize(nextPreference);
    const theme = resolved(preference);
    document.documentElement.dataset.designSystemTheme = theme;
    document.documentElement.dataset.designSystemThemePreference = preference;
    document.documentElement.style.colorScheme = theme;
    if (persist) {
        try {
            localStorage.setItem(STORAGE_KEY, preference);
        } catch {
            // Storage is optional; the active in-memory preference remains valid.
        }
    }
    syncAll();
    emit(document, 'themechange', { preference, theme });
    return theme;
};

export const themePreference = () => preference;

const init = root => {
    if (root === document) {
        preference = normalize(document.documentElement.dataset.designSystemThemePreference ?? storedPreference() ?? 'system');
        applyTheme(preference, false);
    }
    for (const toggle of elements(root, '[data-design-system-theme-toggle]')) {
        if (controllers.has(toggle)) {
            syncToggle(toggle);
            continue;
        }
        const controller = new AbortController();
        const restoreEnhancement = markEnhanced(toggle, 'theme-toggle');
        toggle.addEventListener('click', () => applyTheme(resolved(preference) === 'dark' ? 'light' : 'dark'), { signal: controller.signal });
        controllers.set(toggle, { abort() { controller.abort(); restoreEnhancement(); } });
        syncToggle(toggle);
    }
};

const destroy = root => {
    for (const toggle of elements(root, '[data-design-system-theme-toggle]')) {
        controllers.get(toggle)?.abort();
        controllers.delete(toggle);
    }
};

media.addEventListener('change', () => {
    if (preference === 'system') applyTheme('system', false);
});

export default { init, destroy };
