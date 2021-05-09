import {IScrapped} from "./SiteScrapper";

function isForCodeReview(scrapped: IScrapped) {
    return (scrapped.isCodeReviewRequired || scrapped.isRequestedChanges)
        && !scrapped.isBuildError
        && !scrapped.isToCorrect
        && !scrapped.isChangesApproved;
}

export {
    isForCodeReview
}
