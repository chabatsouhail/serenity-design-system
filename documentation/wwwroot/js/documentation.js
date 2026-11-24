const colorThemeControlSelector = '[data-documentation-color-theme-control]';
const colorThemeSourceSelector = '[data-documentation-color-theme]';
const referenceTocSelector = '[data-documentation-reference-toc]';
const pageContextSelector = '[data-documentation-page-context]';
const pageContextSentinelSelector = '[data-documentation-page-context-sentinel]';
const compactControlSelector = '[data-documentation-page-compact-control-for]';
const compactControlHostSelector = '[data-documentation-page-compact-controls]';
const compactControlOrigins = new WeakMap();

const syncColorThemeTable = (control, theme, preserveScroll = false) => {
    const section = control.closest('[data-documentation-color-semantic-panel]')
        ?? document.querySelector('[data-documentation-color-semantic-panel]');
    if (!section) return;

    const scrollPosition = preserveScroll
        ? { left: window.scrollX, top: window.scrollY }
        : null;

    for (const source of section.querySelectorAll(colorThemeSourceSelector)) {
        source.hidden = source.dataset.documentationColorTheme !== theme;
    }

    if (scrollPosition) {
        window.scrollTo(scrollPosition.left, scrollPosition.top);
        window.requestAnimationFrame(() => window.scrollTo(scrollPosition.left, scrollPosition.top));
    }
};

for (const control of document.querySelectorAll(colorThemeControlSelector)) {
    const selected = control.querySelector('[aria-pressed="true"]');
    if (selected instanceof HTMLElement) syncColorThemeTable(control, selected.dataset.designSystemValue);
}

document.addEventListener('design-system:change', event => {
    const control = event.target;
    if (!(control instanceof HTMLElement)) return;

    if (control.matches(colorThemeControlSelector)) {
        const theme = event.detail?.value;
        if (typeof theme === 'string') syncColorThemeTable(control, theme, true);
        return;
    }

    const contracts = [
        ['data-documentation-typography-style-control', '[data-documentation-typography-style-specimen]'],
        ['data-documentation-typography-size-control', '[data-documentation-typography-size-specimen]'],
        ['data-documentation-typography-weight-control', '[data-documentation-typography-weight-specimen]'],
        ['data-documentation-typography-line-height-control', '[data-documentation-typography-line-height-specimen]']
    ];
    const contract = contracts.find(([attribute]) => control.hasAttribute(attribute));
    if (!contract) return;

    const [attribute, specimenSelector] = contract;
    const property = control.getAttribute(attribute);
    const specimen = control.closest(specimenSelector);
    const value = event.detail?.value;
    if (!(specimen instanceof HTMLElement) || typeof value !== 'string') return;

    if (property === 'family') specimen.dataset.documentationTypographyFamily = value;
    if (property === 'style') specimen.dataset.documentationTypographyStyle = value;
});

const referenceTocs = [...document.querySelectorAll(referenceTocSelector)];
const referenceTocScrollLocks = new WeakMap();
const pageContexts = [...document.querySelectorAll(pageContextSelector)]
    .map(context => ({
        context,
        sentinel: context.parentElement?.querySelector(pageContextSentinelSelector),
        topbar: document.querySelector('.documentation-topbar')
    }))
    .filter(({ sentinel, topbar }) => sentinel instanceof HTMLElement && topbar instanceof HTMLElement);

for (const control of document.querySelectorAll(compactControlSelector)) {
    const origin = document.createComment('documentation compact control origin');
    control.after(origin);
    compactControlOrigins.set(control, origin);
}

const restoreCompactControl = control => {
    const origin = compactControlOrigins.get(control);
    if (origin instanceof Comment && origin.isConnected) origin.before(control);
};

const syncCompactControl = (context, sectionId, visibleInContext) => {
    const host = context.querySelector(compactControlHostSelector);
    if (!(host instanceof HTMLElement)) return;

    const target = visibleInContext
        ? document.querySelector(`${compactControlSelector}[data-documentation-page-compact-control-for="${CSS.escape(sectionId)}"]`)
        : null;

    for (const control of host.querySelectorAll(compactControlSelector)) {
        if (control !== target) restoreCompactControl(control);
    }

    if (target instanceof HTMLElement && target.parentElement !== host) host.append(target);
};

const syncCompactNestedContext = context => {
    const sectionId = context.dataset.documentationPageCompactSectionId;
    const sectionHeading = sectionId ? document.getElementById(sectionId) : null;
    const compact = context.hasAttribute('data-documentation-page-context-compact');
    let sectionHeadingVisible = true;

    if (compact && sectionHeading instanceof HTMLElement) {
        const headingRect = sectionHeading.getBoundingClientRect();
        const contextBottom = context.getBoundingClientRect().bottom;
        sectionHeadingVisible = headingRect.bottom > contextBottom
            && headingRect.top < window.innerHeight;
    }

    const nested = compact && sectionHeading instanceof HTMLElement && !sectionHeadingVisible;
    context.toggleAttribute('data-documentation-page-context-nested', nested);
    syncCompactControl(context, sectionId, nested);
};

const syncPageContexts = () => {
    for (const { context, sentinel, topbar } of pageContexts) {
        const compact = sentinel.getBoundingClientRect().top <= topbar.getBoundingClientRect().bottom;
        context.toggleAttribute('data-documentation-page-context-compact', compact);
        syncCompactNestedContext(context);
    }
};

let pageContextFrame = 0;
const queuePageContextSync = () => {
    if (pageContextFrame) return;
    pageContextFrame = window.requestAnimationFrame(() => {
        pageContextFrame = 0;
        syncPageContexts();
    });
};

const setCurrentReferenceTocLink = (nav, sectionId) => {
    let currentLink = null;
    for (const link of nav.querySelectorAll('a[href^="#"]')) {
        const current = link.hash === `#${sectionId}`;
        if (current) {
            link.setAttribute('aria-current', 'location');
            currentLink = link;
        }
        else link.removeAttribute('aria-current');
    }

    for (const group of nav.querySelectorAll('[data-documentation-reference-toc-group]')) {
        group.toggleAttribute(
            'data-documentation-reference-toc-group-active',
            currentLink instanceof HTMLAnchorElement && group.contains(currentLink)
        );
    }

    let compactLink = currentLink;
    if (currentLink instanceof HTMLAnchorElement) {
        const group = currentLink.closest('[data-documentation-reference-toc-group]');
        const parentLink = group?.querySelector(':scope > .documentation-reference-toc-parent');
        if (parentLink instanceof HTMLAnchorElement) compactLink = parentLink;
    }

    const compactSection = nav
        .closest('[data-design-system-tabs]')
        ?.querySelector('[data-documentation-page-compact-section]');
    if (compactSection instanceof HTMLElement) {
        compactSection.textContent = compactLink?.textContent?.trim() || '';
        const context = compactSection.closest(pageContextSelector);
        if (context instanceof HTMLElement) {
            context.dataset.documentationPageCompactSectionId = compactLink?.hash.slice(1) || '';
            syncCompactNestedContext(context);
        }
    }
};

const syncReferenceTocs = () => {
    for (const nav of referenceTocs) {
        const panel = nav.closest('[role="tabpanel"]');
        if (panel instanceof HTMLElement && panel.hidden) continue;
        if (nav.offsetParent === null) continue;
        if (referenceTocScrollLocks.has(nav)) continue;

        const sections = [...nav.querySelectorAll('a[href^="#"]')]
            .map(link => document.getElementById(link.hash.slice(1)))
            .filter(section => section instanceof HTMLElement);
        if (!sections.length) continue;

        const fallbackMarker = Number.parseFloat(getComputedStyle(sections[0]).scrollMarginBlockStart)
            || Math.min(window.innerHeight * .25, 180);
        const markerTolerance = 1;
        let current = sections[0];
        for (const section of sections) {
            const sectionStyle = getComputedStyle(section);
            const marker = (Number.parseFloat(sectionStyle.scrollMarginBlockStart) || fallbackMarker)
                + (Number.parseFloat(sectionStyle.getPropertyValue('--_documentation-reference-active-lead')) || 0);
            if (section.getBoundingClientRect().top <= marker + markerTolerance) current = section;
        }
        const pageCanScroll = document.documentElement.scrollHeight > window.innerHeight + 2;
        if (pageCanScroll
            && window.scrollY > 1
            && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
            current = sections.at(-1);
        }
        setCurrentReferenceTocLink(nav, current.id);
    }
};

let referenceTocFrame = 0;
const queueReferenceTocSync = () => {
    if (referenceTocFrame) return;
    referenceTocFrame = window.requestAnimationFrame(() => {
        referenceTocFrame = 0;
        syncReferenceTocs();
    });
};

const releaseReferenceTocScrollLock = nav => {
    const lock = referenceTocScrollLocks.get(nav);
    if (!lock) return;

    window.clearTimeout(lock.timeout);
    referenceTocScrollLocks.delete(nav);
};

const scheduleReferenceTocScrollLockRelease = nav => {
    const lock = referenceTocScrollLocks.get(nav);
    if (!lock) return;

    window.clearTimeout(lock.timeout);
    lock.timeout = window.setTimeout(() => releaseReferenceTocScrollLock(nav), 140);
};

const lockReferenceTocSelection = (nav, sectionId) => {
    const existingLock = referenceTocScrollLocks.get(nav);
    if (existingLock) window.clearTimeout(existingLock.timeout);

    referenceTocScrollLocks.set(nav, { sectionId, timeout: 0 });
    setCurrentReferenceTocLink(nav, sectionId);
    scheduleReferenceTocScrollLockRelease(nav);
};

for (const nav of referenceTocs) {
    nav.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!(link instanceof HTMLAnchorElement) || !nav.contains(link)) return;

        const section = document.getElementById(link.hash.slice(1));
        if (!(section instanceof HTMLElement)) return;

        event.preventDefault();
        lockReferenceTocSelection(nav, link.hash.slice(1));
        window.history.pushState(null, '', link.hash);
        section.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    });
}

window.addEventListener('scroll', () => {
    queuePageContextSync();
    queueReferenceTocSync();
    for (const nav of referenceTocs) {
        if (referenceTocScrollLocks.has(nav)) scheduleReferenceTocScrollLockRelease(nav);
    }
}, { passive: true });
window.addEventListener('resize', () => {
    queuePageContextSync();
    queueReferenceTocSync();
});
document.addEventListener('click', event => {
    if (event.target.closest('[data-design-system-tab]')) queueReferenceTocSync();
});

queuePageContextSync();
queueReferenceTocSync();
