export const elements = (root, selector) => {
    const matches = [];
    if (root instanceof Element && root.matches(selector)) matches.push(root);
    if (root?.querySelectorAll) matches.push(...root.querySelectorAll(selector));
    return matches;
};

export const focusable = root => [...root.querySelectorAll(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
)].filter(element => !element.hidden && element.getClientRects().length > 0);

