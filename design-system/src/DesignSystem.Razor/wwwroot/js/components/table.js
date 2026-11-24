import { elements } from '../core/dom.js?v=18.1.0';
import { markEnhanced } from '../core/enhancement.js?v=18.1.0';
import { emit } from '../core/events.js?v=18.1.0';

const controllers = new WeakMap();

const setup = table => {
    const controller = new AbortController();
    const restoreEnhancement = markEnhanced(table, 'table');
    const { signal } = controller;
    const headerSelection = table.querySelector('thead input[data-design-system-select-all], thead .design-system-table__selection input[type="checkbox"]');
    const rowSelections = [...table.querySelectorAll('tbody input[type="checkbox"]')]
        .filter(input => input.closest('.design-system-table__selection, [data-design-system-row-selection]'));
    const sortButtons = [...table.querySelectorAll('.design-system-table__sort, [data-design-system-sort]')]
        .filter(button => button.matches('button, [role="button"]'));
    const filters = [...table.querySelectorAll('[data-design-system-table-filter], :is(input, select, textarea).design-system-table__filter, .design-system-table__filter :is(input, select, textarea)')];

    const selectableRows = () => rowSelections.filter(input => !input.disabled && input.closest('tr')?.getAttribute('aria-disabled') !== 'true');
    const selectedRows = () => rowSelections.filter(input => input.checked).map(input => input.closest('tr')).filter(Boolean);

    const syncSelection = (emitChange = false, source = null) => {
        for (const input of rowSelections) {
            const row = input.closest('tr');
            if (!row) continue;
            row.setAttribute('aria-selected', input.checked ? 'true' : 'false');
            if (input.checked) row.dataset.designSystemSelected = '';
            else delete row.dataset.designSystemSelected;
        }
        const available = selectableRows();
        const count = available.filter(input => input.checked).length;
        if (headerSelection) {
            headerSelection.checked = available.length > 0 && count === available.length;
            headerSelection.indeterminate = count > 0 && count < available.length;
            headerSelection.disabled = available.length === 0;
            headerSelection.setAttribute('aria-checked', headerSelection.indeterminate ? 'mixed' : headerSelection.checked ? 'true' : 'false');
        }
        if (emitChange) {
            const rows = selectedRows();
            emit(table, 'selectionchange', {
                source,
                count: rows.length,
                values: rows.map(row => row.dataset.designSystemValue ?? row.id ?? ''),
                rows
            });
        }
    };

    headerSelection?.addEventListener('change', () => {
        for (const input of selectableRows()) {
            input.checked = headerSelection.checked;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        syncSelection(true, 'header');
    }, { signal });
    for (const input of rowSelections) {
        input.addEventListener('change', () => syncSelection(true, 'row'), { signal });
    }

    for (const button of sortButtons) {
        button.addEventListener('click', () => {
            const header = button.closest('th');
            const current = header?.getAttribute('aria-sort') || button.dataset.designSystemSort || 'none';
            const direction = current === 'ascending' ? 'descending' : 'ascending';
            for (const peer of sortButtons) {
                const peerHeader = peer.closest('th');
                peer.dataset.designSystemSort = peer === button ? direction : 'none';
                peer.removeAttribute('aria-sort');
                peerHeader?.setAttribute('aria-sort', peer === button ? direction : 'none');
            }
            emit(table, 'sortchange', {
                column: button.dataset.designSystemColumn ?? header?.dataset.designSystemColumn ?? header?.id ?? '',
                direction
            });
        }, { signal });
    }

    for (const filter of filters) {
        const notify = () => {
            const header = filter.closest('th');
            emit(table, 'filterchange', {
                column: filter.dataset.designSystemColumn ?? header?.dataset.designSystemColumn ?? header?.id ?? '',
                value: filter.value,
                values: filter instanceof HTMLSelectElement ? [...filter.selectedOptions].map(option => option.value) : undefined
            });
        };
        const changeOnly = filter instanceof HTMLSelectElement ||
            (filter instanceof HTMLInputElement && ['checkbox', 'radio', 'file'].includes(filter.type));
        filter.addEventListener(changeOnly ? 'change' : 'input', notify, { signal });
        filter.addEventListener('keydown', event => {
            if (event.key === 'Escape' && filter.value) {
                event.preventDefault();
                filter.value = '';
                filter.dispatchEvent(new Event('input', { bubbles: true }));
                filter.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, { signal });
    }

    table.closest('form')?.addEventListener('reset', () => queueMicrotask(() => syncSelection(false)), { signal });
    syncSelection(false);
    return { abort() { controller.abort(); restoreEnhancement(); } };
};

const init = root => {
    for (const table of elements(root, '.design-system-table')) {
        if (!controllers.has(table)) controllers.set(table, setup(table));
    }
};

const destroy = root => {
    for (const table of elements(root, '.design-system-table')) {
        controllers.get(table)?.abort();
        controllers.delete(table);
    }
};

export default { init, destroy };
