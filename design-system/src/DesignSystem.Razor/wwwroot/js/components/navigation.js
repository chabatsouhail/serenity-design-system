import { elements, focusable } from '../core/dom.js?v=18.1.0';
import { markEnhanced, reportEnhancementFailure } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const treeControllers = new WeakMap();
const shellControllers = new WeakMap();
let shellSequence = 0;

const safeStorage = {
    read(key) {
        try { return JSON.parse(sessionStorage.getItem(key) ?? '[]'); } catch { return []; }
    },
    write(key, value) {
        try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Persistence is optional. */ }
    }
};

const branchKey = branch => branch.dataset.designSystemNavigationKey || branch.id || null;

const setupTree = tree => {
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(tree, 'navigation-tree');
    const { signal } = controller;
    const branches = [...tree.querySelectorAll('details.design-system-navigation-branch, details[data-design-system-navigation-branch]')];
    const persistKey = tree.dataset.designSystemPersistKey || (tree.id ? `design-system-navigation:${tree.id}` : null);
    const stored = new Set(persistKey ? safeStorage.read(persistKey) : []);

    for (const current of tree.querySelectorAll('[aria-current="page"]')) {
        for (let branch = current.closest('details'); branch && tree.contains(branch); branch = branch.parentElement?.closest('details')) {
            branch.open = true;
            branch.dataset.designSystemCurrentPath = '';
        }
    }
    for (const branch of branches) {
        const key = branchKey(branch);
        if (key && stored.has(key)) branch.open = true;
        branch.addEventListener('toggle', () => {
            if (persistKey) {
                const openKeys = branches.filter(item => item.open).map(branchKey).filter(Boolean);
                safeStorage.write(persistKey, openKeys);
            }
            emit(tree, 'navigationtoggle', { key, open: branch.open });
        }, { signal });
        const summary = branch.querySelector(':scope > summary');
        summary?.addEventListener('keydown', event => {
            if (event.key === 'ArrowRight' && !branch.open) {
                event.preventDefault();
                branch.open = true;
            } else if (event.key === 'ArrowRight' && branch.open) {
                const first = branch.querySelector(':scope > .design-system-navigation-list a, :scope > .design-system-navigation-list summary');
                if (first) {
                    event.preventDefault();
                    first.focus();
                }
            } else if (event.key === 'ArrowLeft' && branch.open) {
                event.preventDefault();
                branch.open = false;
            } else if (event.key === 'ArrowLeft') {
                const parent = branch.parentElement?.closest('details');
                const parentSummary = parent?.querySelector(':scope > summary');
                if (parentSummary) {
                    event.preventDefault();
                    parentSummary.focus();
                }
            }
        }, { signal });
    }
    tree.addEventListener('click', event => {
        const disabled = event.target.closest?.('a[aria-disabled="true"], button[aria-disabled="true"]');
        if (disabled) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, { signal });
    return { abort() { controller.abort(); restoreEnhancement(); } };
};

const setupShell = shell => {
    const navigation = shell.querySelector(':scope > [data-design-system-shell-navigation]');
    const main = shell.querySelector(':scope > [data-design-system-shell-main]');
    const compactHeader = shell.querySelector(':scope > [data-design-system-shell-compact-header]');
    const triggers = [...shell.querySelectorAll('[data-design-system-shell-trigger], .design-system-shell-trigger')];
    const missing = [];
    if (!navigation) missing.push('navigation region');
    if (!main) missing.push('main region');
    if (!compactHeader) missing.push('compact header');
    if (!triggers.length) missing.push('navigation trigger');
    if (missing.length) return reportEnhancementFailure(shell, 'side-navigation', missing);

    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(shell, 'side-navigation');
    const restoreTriggerEnhancements = triggers.map(trigger => markEnhanced(trigger, 'side-navigation-trigger'));
    const { signal } = controller;
    const media = window.matchMedia('(max-width: 760px)');
    const initialNavigationHidden = navigation.hidden;
    const initiallyReady = shell.hasAttribute('data-design-system-shell-ready');
    const initialMainInert = main.inert;
    let scrim = shell.querySelector(':scope > [data-design-system-shell-scrim], :scope > .design-system-shell-scrim');
    let generatedScrim = false;
    let open = false;
    let opener = null;

    if (!navigation.id) navigation.id = `design-system-shell-navigation-${++shellSequence}`;
    for (const trigger of triggers) {
        trigger.setAttribute('aria-controls', navigation.id);
        trigger.setAttribute('aria-expanded', 'false');
    }
    if (!scrim) {
        scrim = document.createElement('div');
        scrim.className = 'design-system-shell-scrim';
        scrim.dataset.designSystemShellScrim = '';
        scrim.hidden = true;
        shell.append(scrim);
        generatedScrim = true;
    }

    const mode = () => shell.dataset.designSystemCompactNavigation === 'popover' ? 'popover' : 'panel';
    const setExpanded = value => triggers.forEach(trigger => trigger.setAttribute('aria-expanded', value ? 'true' : 'false'));
    const restoreMain = () => { main.inert = initialMainInert; };

    const close = (reason = 'dismiss', restoreFocus = false) => {
        if (!media.matches) return;
        navigation.hidden = true;
        scrim.hidden = true;
        setExpanded(false);
        restoreMain();
        delete document.documentElement.dataset.designSystemShellPanelOpen;
        const returnTarget = opener;
        opener = null;
        const wasOpen = open;
        open = false;
        if (restoreFocus && returnTarget?.isConnected) returnTarget.focus();
        if (wasOpen) emit(shell, 'navigationclose', { reason, mode: mode() });
    };

    const show = trigger => {
        if (!media.matches || open) return;
        opener = trigger;
        navigation.hidden = false;
        scrim.hidden = mode() !== 'panel';
        setExpanded(true);
        open = true;
        if (mode() === 'panel') {
            main.inert = true;
            document.documentElement.dataset.designSystemShellPanelOpen = '';
        }
        const initial = navigation.querySelector('[data-design-system-shell-close], [data-design-system-initial-focus]') ?? focusable(navigation)[0] ?? navigation;
        if (initial === navigation && !navigation.hasAttribute('tabindex')) navigation.tabIndex = -1;
        requestAnimationFrame(() => initial.focus({ preventScroll: true }));
        emit(shell, 'navigationopen', { mode: mode() });
    };

    const syncViewport = () => {
        if (media.matches) {
            close('viewport', false);
            navigation.hidden = true;
            scrim.hidden = true;
        } else {
            open = false;
            opener = null;
            navigation.hidden = false;
            scrim.hidden = true;
            setExpanded(false);
            restoreMain();
            delete document.documentElement.dataset.designSystemShellPanelOpen;
        }
    };

    for (const trigger of triggers) trigger.addEventListener('click', () => open ? close('trigger', true) : show(trigger), { signal });
    for (const closer of navigation.querySelectorAll('[data-design-system-shell-close]')) closer.addEventListener('click', () => close('close-button', true), { signal });
    scrim.addEventListener('click', () => close('scrim', true), { signal });
    navigation.addEventListener('click', event => {
        if (media.matches && event.target.closest?.('a[href]')) close('navigation', false);
    }, { signal });
    document.addEventListener('pointerdown', event => {
        if (open && mode() === 'popover' && !navigation.contains(event.target) && !triggers.some(trigger => trigger.contains(event.target))) close('outside', false);
    }, { capture: true, signal });
    document.addEventListener('keydown', event => {
        if (!open) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close('escape', true);
            return;
        }
        if (event.key !== 'Tab' || mode() !== 'panel') return;
        const available = focusable(navigation);
        if (!available.length) {
            event.preventDefault();
            navigation.focus();
        } else if (event.shiftKey && document.activeElement === available[0]) {
            event.preventDefault();
            available.at(-1).focus();
        } else if (!event.shiftKey && document.activeElement === available.at(-1)) {
            event.preventDefault();
            available[0].focus();
        }
    }, { signal });
    media.addEventListener('change', syncViewport, { signal });

    shell.dataset.designSystemShellReady = '';
    syncViewport();
    return {
        abort() {
            controller.abort();
            open = false;
            navigation.hidden = initialNavigationHidden;
            main.inert = initialMainInert;
            delete document.documentElement.dataset.designSystemShellPanelOpen;
            if (!initiallyReady) delete shell.dataset.designSystemShellReady;
            if (generatedScrim) scrim.remove();
            for (const restore of restoreTriggerEnhancements) restore();
            restoreEnhancement();
        }
    };
};

const init = root => {
    for (const tree of elements(root, '.design-system-navigation-tree')) {
        if (!treeControllers.has(tree)) treeControllers.set(tree, setupTree(tree));
    }
    for (const shell of elements(root, '[data-design-system-shell]')) {
        if (!shellControllers.has(shell)) {
            const controller = setupShell(shell);
            if (controller) shellControllers.set(shell, controller);
        }
    }
};

const destroy = root => {
    for (const tree of elements(root, '.design-system-navigation-tree')) {
        treeControllers.get(tree)?.abort();
        treeControllers.delete(tree);
    }
    for (const shell of elements(root, '[data-design-system-shell]')) {
        shellControllers.get(shell)?.abort();
        shellControllers.delete(shell);
    }
};

export default { init, destroy };
