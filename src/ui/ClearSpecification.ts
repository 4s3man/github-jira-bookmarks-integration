import {ITableDemoRow} from "./TableDemo";

class ClearSpecification {
    shouldClear(row: ITableDemoRow) {
        const scrapped = row.scrapped;

        return scrapped.isMerged
            || scrapped.isClosed;
    }
}

const clearSpecification = new ClearSpecification();

export {clearSpecification};