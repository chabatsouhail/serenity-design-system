const VIEWPORT_GUTTER = 14;
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

export const positionFloating = (anchor, surface, options = {}) => {
    const alignment = options.alignment ?? 'end';
    const gap = options.gap ?? 6;
    const anchorRect = anchor.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;
    const availableWidth = Math.max(0, viewportWidth - (2 * VIEWPORT_GUTTER));
    const surfaceWidth = Math.min(surfaceRect.width, availableWidth);
    const direction = getComputedStyle(anchor).direction;
    const logicalStart = direction === 'rtl' ? anchorRect.right - surfaceRect.width : anchorRect.left;
    const logicalEnd = direction === 'rtl' ? anchorRect.left : anchorRect.right - surfaceRect.width;
    const left = clamp(alignment === 'start' ? logicalStart : logicalEnd, viewportLeft + VIEWPORT_GUTTER, viewportRight - surfaceWidth - VIEWPORT_GUTTER);
    const spaceBelow = viewportBottom - anchorRect.bottom - gap - VIEWPORT_GUTTER;
    const spaceAbove = anchorRect.top - viewportTop - gap - VIEWPORT_GUTTER;
    const above = spaceBelow < Math.min(surfaceRect.height, 180) && spaceAbove > spaceBelow;
    const availableHeight = Math.max(80, above ? spaceAbove : spaceBelow);
    const top = above ? Math.max(viewportTop + VIEWPORT_GUTTER, anchorRect.top - gap - Math.min(surfaceRect.height, availableHeight)) : anchorRect.bottom + gap;

    surface.style.position = 'fixed';
    if (surfaceWidth > 0) surface.style.width = `${Math.ceil(surfaceWidth)}px`;
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
    surface.style.maxWidth = `${availableWidth}px`;
    surface.style.maxHeight = `${Math.floor(availableHeight)}px`;
    surface.dataset.designSystemPosition = above ? 'above' : 'below';
};

export const positionAtPoint = (surface, clientX, clientY) => {
    const surfaceRect = surface.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;
    const availableWidth = Math.max(0, viewportWidth - (2 * VIEWPORT_GUTTER));
    const availableViewportHeight = Math.max(0, viewportHeight - (2 * VIEWPORT_GUTTER));
    const surfaceWidth = Math.min(surfaceRect.width, availableWidth);
    const surfaceHeight = Math.min(surfaceRect.height, availableViewportHeight);
    const left = clamp(clientX, viewportLeft + VIEWPORT_GUTTER, viewportRight - surfaceWidth - VIEWPORT_GUTTER);
    const top = clamp(clientY, viewportTop + VIEWPORT_GUTTER, viewportBottom - surfaceHeight - VIEWPORT_GUTTER);

    surface.style.position = 'fixed';
    if (surfaceWidth > 0) surface.style.width = `${Math.ceil(surfaceWidth)}px`;
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
    surface.style.maxWidth = `${availableWidth}px`;
    surface.style.maxHeight = `${availableViewportHeight}px`;
    surface.dataset.designSystemPosition = 'point';
};

export const resetFloating = surface => {
    for (const property of ['position', 'width', 'left', 'top', 'max-width', 'max-height']) surface.style.removeProperty(property);
    delete surface.dataset.designSystemPosition;
};
