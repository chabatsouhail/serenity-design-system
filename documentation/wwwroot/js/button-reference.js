// Documentation controls compose the public Button contract. All visual states remain library-owned.
const controllers = new Map();
const defaults = { variant: 'filled', tone: 'accent', size: 'medium', composition: 'both', state: 'normal', width: 'content', theme: 'light' };
const ns = 'http://www.w3.org/2000/svg';
const rounded = value => Math.round(value * 10) / 10;

function setup(page) {
    if (controllers.has(page)) return;
    const abort = new AbortController();
    const signal = abort.signal;
    const blueprint = page.querySelector('[data-button-blueprint]');
    const drawing = page.querySelector('[data-button-drawing]');
    const magnified = page.querySelector('[data-button-magnified]');
    const specimen = magnified.querySelector('button');
    const guides = page.querySelector('[data-button-guides]');
    const live = page.querySelector('[data-button-live-area] button');
    const state = { ...defaults, theme: document.documentElement.dataset.designSystemTheme || 'light' };
    const labelInput = page.querySelector('[data-button-label]');
    const wrapInput = page.querySelector('[data-button-wrap]');
    const liveArea = page.querySelector('[data-button-live-area]');
    const liveStatus = page.querySelector('[data-button-live-status]');
    const code = page.querySelector('[data-button-code]');
    let frame = 0;
    let clicks = 0;

    const node = (tag, attributes = {}, content = '') => {
        const element = document.createElementNS(ns, tag);
        for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
        if (content) element.textContent = content;
        guides.append(element);
        return element;
    };
    const line = (x1, y1, x2, y2) => node('line', { x1, y1, x2, y2 });
    const text = (x, y, label, anchor = 'middle') => node('text', { x, y, 'text-anchor': anchor }, label);
    const box = (r, className) => node('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: className });
    const measure = (x1, x2, y, label) => {
        line(x1, y, x2, y);
        line(x1, y - 4, x1, y + 4);
        line(x2, y - 4, x2, y + 4);
        text((x1 + x2) / 2, y - 9, label);
    };
    const callout = (x, y, tx, ty, label, anchor = 'middle') => {
        node('path', { d: `M ${x} ${y} L ${x} ${ty + (ty < y ? 10 : -16)} L ${tx} ${ty + (ty < y ? 10 : -16)}` });
        node('circle', { cx: x, cy: y, r: 2 });
        text(tx, ty, label, anchor);
    };

    function draw() {
        frame = 0;
        if (!drawing.offsetWidth || !drawing.offsetHeight) return;
        // Coordinates and magnification are measured illustration data, not new design Tokens.
        const zoom = Math.min(3, Math.max(.8, (drawing.clientWidth - 88) / specimen.offsetWidth));
        magnified.style.setProperty('--_button-ref-zoom', String(zoom));
        const bounds = drawing.getBoundingClientRect();
        const rect = element => {
            const r = element.getBoundingClientRect();
            return { x: r.left - bounds.left, y: r.top - bounds.top, w: r.width, h: r.height };
        };
        const b = rect(specimen);
        const leading = rect(specimen.querySelector('[data-button-part="leading"]'));
        const trailing = rect(specimen.querySelector('[data-button-part="trailing"]'));
        const label = rect(specimen.querySelector('[data-button-part="label"]'));
        const css = getComputedStyle(specimen);
        const border = parseFloat(css.borderLeftWidth);
        const pad = parseFloat(css.paddingLeft);
        const gap = parseFloat(css.gap);
        const scale = b.w / parseFloat(css.width);
        const small = drawing.clientWidth < 540;
        const unit = number => `${rounded(number)}${small ? '' : 'px'}`;
        guides.replaceChildren();
        guides.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
        const mode = blueprint.dataset.diagramMode;
        if (mode === 'parts') {
            box(label, 'button-guide-part'); box(leading, 'button-guide-part'); box(trailing, 'button-guide-part');
            callout(b.x, b.y, b.x, b.y - (small ? 66 : 40), 'A · Container', 'start');
            callout(label.x + label.w / 2, label.y, label.x + label.w / 2, b.y - (small ? 30 : 40), 'B · Label');
            callout(leading.x + leading.w / 2, leading.y + leading.h, leading.x + leading.w / 2, b.y + b.h + 48, small ? 'C · Leading' : 'C · Leading Icon');
            callout(trailing.x + trailing.w / 2, trailing.y + trailing.h, trailing.x + trailing.w / 2, b.y + b.h + 48, small ? 'D · Trailing' : 'D · Trailing Icon');
        } else if (mode === 'type') {
            box(label, 'button-guide-part'); box(leading, 'button-guide-part'); box(trailing, 'button-guide-part');
            callout(label.x + label.w / 2, label.y, b.x + b.w / 2, b.y - 36, `${css.fontSize} · ${css.fontWeight} · line-height 1`);
            callout(leading.x + leading.w / 2, leading.y + leading.h, leading.x + leading.w / 2, b.y + b.h + 42, '16 × 16px');
            callout(b.x + b.w, b.y + b.h, b.x + b.w, b.y + b.h + 70, '8px radius · 1px boundary', 'end');
        } else {
            const top = b.y - 26;
            const start = b.x + border * scale;
            const end = b.x + b.w - border * scale;
            box({ x: start, y: b.y + border * scale, w: pad * scale, h: b.h - 2 * border * scale }, 'button-guide-area');
            box({ x: end - pad * scale, y: b.y + border * scale, w: pad * scale, h: b.h - 2 * border * scale }, 'button-guide-area');
            box({ x: leading.x + leading.w, y: leading.y, w: label.x - leading.x - leading.w, h: leading.h }, 'button-guide-area');
            box({ x: label.x + label.w, y: trailing.y, w: trailing.x - label.x - label.w, h: trailing.h }, 'button-guide-area');
            measure(start, leading.x, top, unit(pad));
            measure(leading.x + leading.w, label.x, top, unit(gap));
            measure(label.x + label.w, trailing.x, top, unit(gap));
            measure(trailing.x + trailing.w, end, top, unit(pad));
            const hx = b.x - 18;
            line(hx, b.y, hx, b.y + b.h); line(hx - 4, b.y, hx + 4, b.y); line(hx - 4, b.y + b.h, hx + 4, b.y + b.h);
            node('text', { x: hx - 9, y: b.y + b.h / 2, 'text-anchor': 'middle', transform: `rotate(-90 ${hx - 9} ${b.y + b.h / 2})` }, `${rounded(parseFloat(css.height))}px`);
            measure(b.x, b.x + b.w, b.y + b.h + 38, `${rounded(b.w / scale)}px · content width`);
        }
        const captions = {
            parts: 'A owns geometry and interaction. B names the action. C and D are optional, decorative Icons.',
            spacing: '14px inside each boundary. 8px between adjacent content parts. The Container owns all spacing.',
            type: 'IBM Plex Sans · Medium 500. The 13px line box and 16px Icons are centered independently.'
        };
        page.querySelector('[data-button-diagram-caption]').textContent = captions[mode];
        page.querySelector('[data-button-zoom-label]').textContent = `${rounded(zoom)}× view · values at 1×`;
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };

    const syncControl = (property, value) => {
        const group = page.querySelector(`[data-button-reference-control="${property}"]`);
        if (!group) return;
        for (const button of group.querySelectorAll('button')) {
            const selected = button.value === value;
            button.setAttribute('aria-pressed', String(selected));
            button.tabIndex = selected ? 0 : -1;
        }
    };
    const icon = part => {
        const source = specimen.querySelector(`[data-button-part="${part}"]`);
        return source.cloneNode(true);
    };
    function measureLive() {
        if (!live.offsetWidth) return;
        const css = getComputedStyle(live);
        page.querySelector('[data-button-live-measure]').textContent = `${live.offsetWidth} × ${live.offsetHeight}px · ${css.paddingLeft} padding · ${css.gap} gap`;
    }
    function render(changedProperty = '') {
        let adjustment = 'Filled supports Tint and Negative.';
        if (state.variant === 'filled' && state.tone === 'neutral') {
            if (changedProperty === 'tone') { state.variant = 'tonal'; adjustment = 'Changed to Tonal: Neutral is supported in Tonal and Text.'; }
            else { state.tone = 'accent'; adjustment = 'Changed to Tint: Filled supports Tint and Negative.'; }
        }
        Object.entries(state).forEach(([property, value]) => syncControl(property, value));
        const label = labelInput.value.trim() || 'Save changes';
        const iconOnly = state.composition === 'icon';
        const loading = state.state === 'loading';
        live.dataset.designSystemVariant = state.variant;
        live.dataset.designSystemTone = state.tone;
        live.dataset.designSystemSize = state.size;
        live.classList.toggle('design-system-icon-button', iconOnly);
        live.toggleAttribute('data-design-system-icon-only', iconOnly);
        live.toggleAttribute('data-design-system-block', state.width === 'block');
        live.toggleAttribute('data-design-system-wrap', wrapInput.checked);
        live.disabled = loading || state.state === 'disabled';
        live.toggleAttribute('data-design-system-disabled', live.disabled);
        live.toggleAttribute('data-design-system-loading', loading);
        if (loading) live.setAttribute('aria-busy', 'true'); else live.removeAttribute('aria-busy');
        if (iconOnly) live.setAttribute('aria-label', label); else live.removeAttribute('aria-label');
        const preview = { hover: 'hover', pressed: 'active', focused: 'focus' }[state.state];
        if (preview) live.dataset.designSystemPreviewState = preview; else delete live.dataset.designSystemPreviewState;
        const children = [];
        if (['leading', 'both', 'icon'].includes(state.composition)) children.push(icon('leading'));
        if (!iconOnly) { const text = document.createElement('span'); text.textContent = label; children.push(text); }
        if (['trailing', 'both'].includes(state.composition)) children.push(icon('trailing'));
        live.replaceChildren();
        if (loading) {
            const spinner = page.querySelector('#button-loading-title').closest('section').querySelector('.design-system-button__spinner').cloneNode(true);
            const content = document.createElement('span'); content.className = 'design-system-button__label design-system-button-label'; content.append(...children);
            const status = document.createElement('span'); status.className = 'design-system-visually-hidden'; status.setAttribute('role', 'status'); status.textContent = 'Saving changes';
            live.append(spinner, content, status);
        } else live.append(...children);
        page.querySelector('[data-button-adjustment]').textContent = adjustment;
        liveStatus.textContent = state.state === 'normal' ? 'Click to test the action.' : loading ? 'Busy · repeated activation disabled.' : state.state === 'disabled' ? 'Disabled · excluded from Tab order.' : 'Simulated state · choose Normal for live interaction.';
        const exported = live.cloneNode(true);
        exported.removeAttribute('data-design-system-preview-state');
        exported.querySelectorAll('[data-button-part]').forEach(element => element.removeAttribute('data-button-part'));
        // Keep public native HTML, including accessible names and loading semantics, in the copied example.
        const attrs = [...exported.attributes].map(a => `${a.name}="${a.value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`);
        code.textContent = `<button ${attrs.join('\n        ')}>\n    ${exported.innerHTML.trim().replaceAll('><', '>\n    <')}\n</button>`;
        requestAnimationFrame(measureLive);
    }
    page.addEventListener('design-system:change', event => {
        const control = event.target.closest('[data-button-reference-control]');
        if (!control) { queue(); requestAnimationFrame(measureLive); return; }
        const property = control.dataset.buttonReferenceControl;
        const value = event.detail?.value;
        if (typeof value !== 'string') return;
        if (property === 'diagram') { blueprint.dataset.diagramMode = value; queue(); }
        else if (Object.hasOwn(state, property)) {
            state[property] = value;
            if (property === 'theme') window.DesignSystem?.theme.apply(value);
            render(property);
        }
    }, { signal });
    labelInput.addEventListener('input', () => render(), { signal });
    wrapInput.addEventListener('change', () => render(), { signal });
    live.addEventListener('click', () => { liveStatus.textContent = `Action activated ${++clicks} ${clicks === 1 ? 'time' : 'times'}.`; }, { signal });
    page.querySelector('[data-button-reset]').addEventListener('click', () => {
        Object.assign(state, defaults, { theme: document.documentElement.dataset.designSystemTheme || 'light' }); labelInput.value = 'Save changes'; wrapInput.checked = false; clicks = 0; render();
    }, { signal });
    page.querySelector('[data-button-copy]').addEventListener('click', async () => {
        const status = page.querySelector('[data-button-copy-status]');
        try { await navigator.clipboard.writeText(code.textContent); status.textContent = 'Button markup copied.'; }
        catch { status.textContent = 'Select the markup and copy it using your keyboard.'; code.closest('pre').focus(); }
    }, { signal });
    const search = page.querySelector('[data-button-token-search]');
    const rows = [...page.querySelectorAll('[data-button-token-row]')];
    function filterTokens() {
        const query = search.value.trim().toLowerCase();
        let count = 0;
        rows.forEach(row => { row.hidden = query !== '' && !row.textContent.toLowerCase().includes(query); if (!row.hidden) count++; });
        page.querySelector('[data-button-token-count]').textContent = `${count} of ${rows.length} Tokens`;
        page.querySelectorAll('[data-button-token-group]').forEach(group => {
            const empty = ![...group.querySelectorAll('[data-button-token-row]')].some(row => !row.hidden);
            group.querySelector('[data-button-group-empty]').hidden = !empty;
            group.querySelector('.design-system-table-wrap').hidden = empty;
        });
    }
    search.addEventListener('input', filterTokens, { signal });
    document.addEventListener('design-system:themechange', event => {
        state.theme = event.detail.theme;
        syncControl('theme', state.theme);
        queue();
    }, { signal });
    const resize = new ResizeObserver(() => { queue(); measureLive(); });
    resize.observe(drawing); resize.observe(liveArea); resize.observe(specimen);
    document.fonts.ready.then(() => { if (!signal.aborted) { queue(); measureLive(); } });
    render(); filterTokens(); queue();
    controllers.set(page, () => { abort.abort(); resize.disconnect(); cancelAnimationFrame(frame); });
}

function init() {
    for (const [page, destroy] of controllers) if (!page.isConnected) { destroy(); controllers.delete(page); }
    document.querySelectorAll('[data-button-reference]').forEach(setup);
}
init();
document.addEventListener('design-system:ready', init);
// Rebind only when a page root is added or removed, not for ordinary specimen updates.
new MutationObserver(records => {
    if (records.some(record => [...record.addedNodes, ...record.removedNodes].some(node => node instanceof Element && (node.matches('[data-button-reference]') || node.querySelector('[data-button-reference]'))))) init();
}).observe(document.body, { childList: true, subtree: true });
