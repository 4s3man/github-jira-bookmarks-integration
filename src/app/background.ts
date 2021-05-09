import {RowRepository} from "../ui/RowRepository";

const UPDATE_INTERVAL_10_MIN = 600000;

const rowRepository = new RowRepository(() => null, () => null);

setInterval(function () {
    rowRepository.updateRows();
}, UPDATE_INTERVAL_10_MIN);
