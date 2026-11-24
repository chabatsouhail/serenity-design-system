const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = 'http://127.0.0.1:5092/components/actions/button';
    const output = path.resolve(__dirname, '../artifacts/button-reference');
    fs.mkdirSync(output, { recursive: true });
    const tab = name => page.getByRole('tab', { name, exact: true });
    const control = (property, value) => page.locator(`[data-button-reference-control="${property}"] button[value="${value}"]`);
    const live = page.locator('[data-button-live-area] > button');
    await page.goto(url);
    await page.waitForFunction(() => document.documentElement.dataset.designSystemRuntime === 'ready');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('[data-button-guides]').childElementCount > 5);
    for (const mode of ['parts', 'type', 'spacing']) {
        await control('diagram', mode).click();
        await page.waitForFunction(m => document.querySelector('[data-button-blueprint]').dataset.diagramMode === m, mode);
        assert.ok(await page.locator('[data-button-guides] text').count() >= 3);
    }
    await page.screenshot({ path: path.join(output, 'anatomy-desktop.png') });

    await tab('Preview').click();
    await control('tone', 'neutral').click();
    assert.equal(await live.getAttribute('data-design-system-variant'), 'tonal');
    assert.equal(await live.getAttribute('data-design-system-tone'), 'neutral');
    await control('variant', 'filled').click();
    assert.equal(await live.getAttribute('data-design-system-tone'), 'accent');
    await control('tone', 'danger').click();
    assert.equal(await live.getAttribute('data-design-system-variant'), 'filled');
    await control('size', 'large').click();
    assert.equal(await live.evaluate(el => el.offsetHeight), 44);
    await control('composition', 'icon').click();
    assert.equal(await live.getAttribute('aria-label'), 'Save changes');
    assert.equal(await live.locator('.design-system-icon').count(), 1);
    await control('state', 'loading').click();
    assert.equal(await live.isDisabled(), true);
    assert.equal(await live.getAttribute('aria-busy'), 'true');
    assert.equal(await live.locator('.design-system-spinner').count(), 1);
    await control('state', 'normal').click();
    await live.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    assert.match(await page.locator('[data-button-live-status]').textContent(), /2 times/);
    await control('theme', 'dark').click();
    assert.equal(await page.locator('html').getAttribute('data-design-system-theme'), 'dark');
    assert.equal(await control('theme', 'dark').getAttribute('aria-pressed'), 'true');
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(output, 'preview-dark.png') });
    await control('state', 'focused').click();
    assert.ok(!(await page.locator('[data-button-code]').textContent()).includes('preview-state'));
    await page.getByRole('button', { name: 'Copy markup', exact: true }).click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /aria-label="Save changes"/);
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    assert.equal(await live.getAttribute('data-design-system-tone'), 'accent');
    await control('theme', 'light').click();

    await tab('Tokens').click();
    const search = page.getByRole('searchbox', { name: 'Find a Button token' });
    await search.fill('filled-danger');
    assert.equal(await page.locator('[data-button-token-row]:visible').count(), 3);
    await search.fill('unmatched-token-example');
    assert.equal(await page.locator('[data-button-token-row]:visible').count(), 0);
    assert.match(await page.locator('[data-button-token-count]').textContent(), /^0 of/);
    await page.getByRole('button', { name: 'Clear token search' }).click();
    assert.ok(await page.locator('[data-button-token-row]:visible').count() > 25);

    for (const width of [320, 390, 560, 760, 960, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const name of ['Anatomy', 'Variants', 'Style', 'Preview', 'Tokens']) {
            await tab(name).click();
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
            assert.equal(overflow, false, `${name} page overflows at ${width}px`);
        }
        if (width === 320) {
            await tab('Anatomy').click();
            await page.locator('[data-button-blueprint]').scrollIntoViewIfNeeded();
            await page.screenshot({ path: path.join(output, 'anatomy-320.png') });
            await tab('Preview').click();
            await page.locator('[data-button-label]').fill('Save changes and continue to the next record with all customer details');
            await control('width', 'block').click();
            await page.locator('[data-button-wrap]').check();
            assert.ok(await live.evaluate(el => el.offsetHeight > 34));
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
            await page.getByRole('button', { name: 'Reset', exact: true }).click();
        }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
    await tab('Anatomy').click();
    await page.locator('[data-button-blueprint]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, 'anatomy-forced-colors.png') });
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
    const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const fallback = await noJs.newPage();
    await fallback.goto(url);
    assert.equal(await fallback.locator('#button-page-panel-preview').isVisible(), true);
    assert.equal(await fallback.locator('#button-page-panel-tokens').isVisible(), true);
    assert.equal(await fallback.locator('[data-button-live-area] button').isVisible(), true);
    const touch = await browser.newContext({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });
    const touchPage = await touch.newPage();
    await touchPage.goto(url);
    assert.ok(await touchPage.locator('[data-button-magnified] button').evaluate(el => el.offsetHeight >= 44));
    assert.deepEqual(errors, []);
    await browser.close();
    console.log('Button reference passed: diagram views, configuration, valid combinations, loading, keyboard, theme, copy, filtering, seven widths, long labels, forced colors, reduced motion, no-JavaScript, and coarse pointer.');
})().catch(error => { console.error(error); process.exit(1); });
