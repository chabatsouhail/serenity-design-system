import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssRoot = path.join(root, 'src', 'DesignSystem.Razor', 'wwwroot', 'css');

const read = relative => fs.readFileSync(path.join(cssRoot, relative), 'utf8');
const declarations = text => new Map(
    [...text.matchAll(/(?<name>--design-system-(?:primitive|semantic)-[a-z0-9-]+)\s*:\s*(?<value>[^;]+);/g)]
        .map(match => [match.groups.name, match.groups.value.trim()]));

const base = new Map();
for (const directory of ['tokens/primitive', 'tokens/semantic']) {
    for (const name of fs.readdirSync(path.join(cssRoot, directory)).filter(file => file.endsWith('.css')).sort()) {
        for (const [token, value] of declarations(read(`${directory}/${name}`))) base.set(token, value);
    }
}

const themes = {
    light: new Map(base),
    dark: new Map(base)
};
for (const [token, value] of declarations(read('tokens/themes/dark.css'))) themes.dark.set(token, value);

const resolve = (tokens, name, trail = []) => {
    if (trail.includes(name)) throw new Error(`Token cycle: ${[...trail, name].join(' -> ')}`);
    const value = tokens.get(name);
    if (!value) throw new Error(`Undefined contrast token ${name}.`);
    const alias = /^var\(\s*(--design-system-[a-z0-9-]+)\s*\)$/.exec(value);
    return alias ? resolve(tokens, alias[1], [...trail, name]) : value;
};

const rgb = value => {
    const hex = /^#([0-9a-f]{6})$/i.exec(value);
    if (hex) {
        const number = Number.parseInt(hex[1], 16);
        return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
    }
    const functional = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*[\d.]+%?)?\s*\)$/i.exec(value);
    if (functional) return functional.slice(1, 4).map(Number);
    throw new Error(`Contrast audit cannot parse color ${value}.`);
};

const luminance = color => rgb(color)
    .map(channel => channel / 255)
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

const ratio = (foreground, background) => {
    const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
    return (values[0] + 0.05) / (values[1] + 0.05);
};

const color = suffix => `--design-system-semantic-color-${suffix}`;
const pairs = [
    ['Primary text / surface', color('text-foreground-primary'), color('surface-background'), 4.5],
    ['Secondary text / surface', color('text-foreground-secondary'), color('surface-background'), 4.5],
    ['Muted text / surface', color('text-foreground-muted'), color('surface-background'), 4.5],
    ['Muted text / elevated surface', color('text-foreground-muted'), color('surface-background-elevated'), 4.5],
    ['Accent text / surface', color('text-foreground-accent'), color('surface-background'), 4.5],
    ['Inverse text / inverse surface', color('text-foreground-inverse'), color('surface-background-inverse'), 4.5],
    ['Filled action label / action', color('text-foreground-inverse'), color('action-background'), 4.5],
    ['Filled action label / action hover', color('text-foreground-inverse'), color('action-background-hover'), 4.5],
    ['Filled negative action label / action', color('text-foreground-inverse'), color('action-background-danger'), 4.5],
    ['Filled negative action label / action hover', color('text-foreground-inverse'), color('action-background-danger-hover'), 4.5],
    ['Neutral action label / neutral action', color('action-foreground-neutral'), color('action-background-neutral'), 4.5],
    ['Neutral action label / neutral action hover', color('action-foreground-neutral'), color('action-background-neutral-hover'), 4.5],
    ['Success status pair', color('status-foreground-success'), color('status-background-success'), 4.5],
    ['Warning status pair', color('status-foreground-warning'), color('status-background-warning'), 4.5],
    ['Danger status pair', color('status-foreground-danger'), color('status-background-danger'), 4.5],
    ['Information status pair', color('status-foreground-info'), color('status-background-info'), 4.5],
    ['Neutral solid badge', color('status-foreground-solid'), color('text-foreground-secondary'), 4.5],
    ['Success solid badge', color('status-foreground-solid'), color('status-foreground-success'), 4.5],
    ['Warning solid badge', color('status-foreground-solid'), color('status-foreground-warning'), 4.5],
    ['Danger solid badge', color('status-foreground-solid'), color('status-foreground-danger'), 4.5],
    ['Information solid badge', color('status-foreground-solid'), color('status-foreground-info'), 4.5],
    ['Focus ring / surface', color('focus-ring'), color('surface-background'), 3],
    ['Strong boundary / surface', color('boundary-border-strong'), color('surface-background'), 3],
    ['Selected boundary / surface', color('boundary-border-selected'), color('surface-background'), 3]
];

let checks = 0;
for (const [theme, tokens] of Object.entries(themes)) {
    for (const [label, foregroundToken, backgroundToken, minimum] of pairs) {
        const foreground = resolve(tokens, foregroundToken);
        const background = resolve(tokens, backgroundToken);
        const measured = ratio(foreground, background);
        if (measured + 0.005 < minimum) {
            throw new Error(`${theme}: ${label} is ${measured.toFixed(2)}:1; expected at least ${minimum}:1 (${foreground} on ${background}).`);
        }
        checks += 1;
    }
}

const darkLayerOrder = [
    color('page-background'),
    color('surface-background'),
    color('surface-background-subtle'),
    color('surface-background-elevated'),
    color('surface-background-hover')
];
let darkLayerChecks = 0;
for (let index = 1; index < darkLayerOrder.length; index += 1) {
    const lowerToken = darkLayerOrder[index - 1];
    const higherToken = darkLayerOrder[index];
    const lowerValue = resolve(themes.dark, lowerToken);
    const higherValue = resolve(themes.dark, higherToken);
    if (luminance(higherValue) <= luminance(lowerValue)) {
        throw new Error(`dark: ${higherToken} must be lighter than ${lowerToken} (${higherValue} is not lighter than ${lowerValue}).`);
    }
    darkLayerChecks += 1;
}

for (const [stateToken, surfaceToken] of [
    [color('surface-background-hover'), color('surface-background-control')],
    [color('surface-background-selected'), color('surface-background-elevated')]
]) {
    const stateValue = resolve(themes.dark, stateToken);
    const surfaceValue = resolve(themes.dark, surfaceToken);
    if (luminance(stateValue) <= luminance(surfaceValue)) {
        throw new Error(`dark: ${stateToken} must be lighter than ${surfaceToken} (${stateValue} is not lighter than ${surfaceValue}).`);
    }
    darkLayerChecks += 1;
}

console.log(`Contrast audit passed: ${checks} light/dark WCAG checks and ${darkLayerChecks} Dark Theme Layer checks.`);
