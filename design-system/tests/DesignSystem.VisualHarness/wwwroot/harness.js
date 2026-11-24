document.documentElement.dataset.harnessReady = "true";
const smoke = new URLSearchParams(location.search).has('smoke');

if (smoke) {
    const root = document.documentElement;
    root.dataset.harnessInteractions = 'running';
    const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
    const frame = () => delay(32);
    const require = (condition, message) => {
        if (!condition) throw new Error(message);
    };
    const waitFor = async (predicate, message, timeout = 2000) => {
        const deadline = performance.now() + timeout;
        while (!predicate() && performance.now() < deadline) await delay(20);
        require(predicate(), message);
    };
    const visible = element => element && !element.hidden && getComputedStyle(element).display !== 'none';

    try {
        await frame();
        require(root.dataset.designSystemRuntime === 'ready', 'Shared runtime did not become ready');
        require(!document.querySelector('[data-design-system-enhancement-error]'), 'A component reported incomplete interactive anatomy');

        const densityEvidence = document.createElement('div');
        densityEvidence.style.cssText = 'position:absolute;inset-inline-start:-10000px;inset-block-start:0;';
        densityEvidence.innerHTML = ['compact', 'normal', 'relaxed'].map(density => `
            <div data-density-evidence="${density}" data-design-system-density="${density}">
                <button class="design-system-button" type="button">Density</button>
                <ul class="design-system-list"><li class="design-system-list__item">Item</li></ul>
                <article class="design-system-card"><div class="design-system-card__body">Container</div></article>
            </div>`).join('');
        document.body.append(densityEvidence);
        await frame();
        const densityExpectations = {
            compact: { height: 30, controlInline: 14, itemBlock: 8, itemInline: 10, container: 16 },
            normal: { height: 34, controlInline: 14, itemBlock: 8, itemInline: 10, container: 16 },
            relaxed: { height: 44, controlInline: 14, itemBlock: 8, itemInline: 10, container: 16 }
        };
        for (const [density, expected] of Object.entries(densityExpectations)) {
            const scope = densityEvidence.querySelector(`[data-density-evidence="${density}"]`);
            const buttonStyle = getComputedStyle(scope.querySelector('.design-system-button'));
            const itemStyle = getComputedStyle(scope.querySelector('.design-system-list__item'));
            const containerStyle = getComputedStyle(scope.querySelector('.design-system-card__body'));
            require(parseFloat(buttonStyle.height) === expected.height, `${density} Density resolved the wrong Control Height`);
            require(parseFloat(buttonStyle.paddingInlineStart) === expected.controlInline, `${density} Density changed the shared Control Padding`);
            require(parseFloat(itemStyle.paddingBlockStart) === expected.itemBlock, `${density} Density changed the shared Item block Padding`);
            require(parseFloat(itemStyle.paddingInlineStart) === expected.itemInline, `${density} Density changed the shared Item inline Padding`);
            require(parseFloat(containerStyle.paddingBlockStart) === expected.container, `${density} Density changed the shared Container Padding`);
        }
        densityEvidence.remove();

        const emphasizedText = document.querySelector('#component-busy-region strong');
        require(getComputedStyle(emphasizedText).fontWeight === '500', 'Emphasized text did not resolve to the Primitive emphasis weight');
        for (const action of document.querySelectorAll('[data-design-system-js-only]')) {
            require(action.dataset.designSystemEnhanced === 'true', `JS-only action was not enhanced: ${action.outerHTML.slice(0, 100)}`);
            require(visible(action), 'Enhanced JS-only action remained hidden');
        }

        const theme = root.dataset.designSystemTheme;
        document.querySelector('[data-design-system-theme-toggle]').click();
        require(root.dataset.designSystemTheme !== theme, 'Theme toggle did not change theme');

        const toggle = document.querySelector('[data-design-system-toggle]');
        const initialPressed = toggle.getAttribute('aria-pressed');
        toggle.click();
        require(toggle.getAttribute('aria-pressed') !== initialPressed, 'Toggle Button did not change state');

        const search = document.querySelector('#component-search .design-system-search');
        search.querySelector('[data-design-system-search-clear]').click();
        require(search.querySelector('input').value === '', 'Search clear did not clear its input');

        const number = document.querySelector('#component-number-field [data-design-system-number]');
        const numberInput = number.querySelector('input[type="number"]');
        const initialNumber = Number(numberInput.value);
        number.querySelector('[data-design-system-number-step="up"]').click();
        require(Number(numberInput.value) === initialNumber + 1, 'Number step action did not update its input');

        const picker = document.querySelector('#component-picker [data-design-system-picker]');
        picker.querySelector('[data-design-system-picker-trigger]').click();
        const pickerOption = [...picker.querySelectorAll('[data-design-system-picker-option]')].find(option => !option.disabled && option.getAttribute('aria-selected') !== 'true');
        pickerOption.click();
        require(picker.querySelector('[data-design-system-picker-control]').value === pickerOption.dataset.designSystemValue, 'Picker did not synchronize the native select');

        const date = document.querySelector('#component-date-picker [data-design-system-date-picker]');
        date.querySelector('[data-design-system-date-picker-trigger]').click();
        require(visible(date.querySelector('[data-design-system-date-picker-dialog]')), 'Date Picker did not open its custom calendar');
        date.querySelector('[data-design-system-date-picker-dialog]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        require(!visible(date.querySelector('[data-design-system-date-picker-dialog]')), 'Date Picker did not close');

        const file = document.querySelector('#component-file-upload [data-design-system-file-upload]');
        require(file.dataset.designSystemEnhanced === 'true', 'File Upload did not enhance');
        require(!visible(file.querySelector('input[type="file"]')), 'Enhanced File Upload exposed its native input');
        require(visible(file.querySelector('[data-design-system-file-upload-trigger]')), 'Enhanced File Upload did not expose its proxy');

        const historyTab = document.querySelector('#tab-history');
        historyTab.click();
        require(historyTab.getAttribute('aria-selected') === 'true' && !document.querySelector('#panel-history').hidden, 'Tabs did not activate the requested panel');

        const segmentedButtons = [...document.querySelectorAll('#component-segmented [data-design-system-segmented] button')];
        segmentedButtons[1].click();
        require(segmentedButtons[1].getAttribute('aria-pressed') === 'true', 'Segmented Control did not change selection');

        const chipRemove = document.querySelector('#component-chip [data-design-system-chip-remove]');
        const removableChip = chipRemove.closest('.design-system-chip');
        chipRemove.click();
        require(!removableChip.isConnected, 'Chip remove action did not remove the chip');

        const sort = document.querySelector('#component-column .design-system-table__sort');
        sort.click();
        require(sort.closest('th').getAttribute('aria-sort') === 'descending', 'Table sort did not change direction');

        const busy = document.querySelector('#component-busy-region [data-design-system-busy-content]');
        require(busy.inert, 'Busy Region did not make pending content inert');

        for (const [containerSelector, dismissSelector, label] of [
            ['#component-alert', '[data-design-system-alert-dismiss]', 'Alert'],
            ['#component-toast', '[data-design-system-toast-dismiss]', 'Toast']
        ]) {
            const dismiss = document.querySelector(`${containerSelector} ${dismissSelector}`);
            const feedback = dismiss.closest('.design-system-alert, .design-system-toast');
            dismiss.click();
            require(!feedback.isConnected, `${label} dismiss action did not remove its feedback surface`);
        }

        const menuTrigger = document.querySelector('#menu-trigger');
        menuTrigger.click();
        const menu = document.querySelector('#component-menu .design-system-menu');
        require(visible(menu), 'Menu did not open');
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        require(!visible(menu), 'Menu did not close with Escape');

        const contextTrigger = document.querySelector('#context-menu-trigger');
        contextTrigger.click();
        const contextMenu = document.querySelector('#context-menu-surface');
        require(visible(contextMenu), 'Context Menu did not open');
        contextMenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        require(!visible(contextMenu), 'Context Menu did not close with Escape');

        const popoverTrigger = document.querySelector('#popover-trigger');
        popoverTrigger.click();
        require(visible(document.querySelector('#popover-example')), 'Popover did not open');
        document.querySelector('#popover-example [data-design-system-popover-close]').click();

        const tooltipTrigger = document.querySelector('#tooltip-trigger');
        tooltipTrigger.focus();
        await frame();
        require(visible(document.querySelector('#tooltip-example')), 'Tooltip did not open on focus');
        tooltipTrigger.blur();
        await delay(150);

        for (const [triggerSelector, surfaceSelector, closeSelector] of [
            ['#dialog-open', '#dialog-example', '[data-design-system-dialog-close]'],
            ['#drawer-open', '#drawer-example', '[data-design-system-drawer-close]'],
            ['#confirmation-open', '#confirmation-example', '[data-design-system-cancel]']
        ]) {
            document.querySelector(triggerSelector).click();
            const surface = document.querySelector(surfaceSelector);
            require(surface.open || surface.dataset.designSystemOpen === 'true', `${surfaceSelector} did not open`);
            surface.querySelector(closeSelector).click();
            await waitFor(
                () => !surface.open && surface.dataset.designSystemOpen !== 'true',
                `${surfaceSelector} did not close`
            );
        }

        require(document.querySelector('#component-navigation-list .design-system-navigation-tree').dataset.designSystemEnhanced === 'true', 'Navigation tree did not enhance');
        root.dataset.harnessInteractions = 'passed';
    } catch (error) {
        root.dataset.harnessInteractions = 'failed';
        root.dataset.harnessInteractionError = error instanceof Error ? error.message : String(error);
        console.error('The design system interaction smoke failed.', error);
    }
}
