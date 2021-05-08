import {RowRepository} from "../ui/RowRepository";

const UPDATE_INTERFAL_10_MIN = 600000;

const rowRepository = new RowRepository(() => null, () => null);

setInterval(function () {
    rowRepository.updateRows();
}, UPDATE_INTERFAL_10_MIN);
