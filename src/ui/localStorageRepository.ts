import {ITableDemoRow} from "./TableDemo";

const LOCAL_STORAGE_ROWS_NAME = 'rows';

function saveRows(rows: ITableDemoRow[]) {
    const prePersistRows = JSON.stringify(rows);
    chrome.extension.getBackgroundPage().localStorage.setItem(LOCAL_STORAGE_ROWS_NAME, prePersistRows);
}

function fetchRows(): ITableDemoRow[] {
    const preFetchRows = chrome.extension.getBackgroundPage().localStorage.getItem(LOCAL_STORAGE_ROWS_NAME);
    return JSON.parse(preFetchRows);
}

export {
    saveRows,
    fetchRows
}
