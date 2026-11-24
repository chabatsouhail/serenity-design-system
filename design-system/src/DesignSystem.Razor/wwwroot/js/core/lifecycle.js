const modules = [];

export const register = module => {
    if (!module || typeof module.init !== 'function' || typeof module.destroy !== 'function') {
        throw new TypeError('A design system lifecycle module must expose init(root) and destroy(root).');
    }
    modules.push(module);
};

export const init = (root = document) => {
    for (const module of modules) module.init(root);
};

export const destroy = (root = document) => {
    for (const module of [...modules].reverse()) module.destroy(root);
};
