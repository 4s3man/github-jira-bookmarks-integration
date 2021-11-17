import {ITableDemoRow} from "./TableDemo";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {IScrapped} from "./SiteScrapper";

function createDefaultScrapped(): IScrapped {
    return {
        isRequestedChanges: false,
        isCodeReviewRequired: false,
        isBuildError: false,
        isChangesApproved: false,
        isInProgress: false,
        isToCorrect: false,
        isReadyToMerge: false,
        isInReview: false,
        isMerged: false,
        isClosed: false,
        isDone: false
    }
}

function createRowFromBookmarkNode(node: BookmarkTreeNode): ITableDemoRow {
    return {
        id: node.id,
        title: node.title,
        url: node.url,
        scrapped: createDefaultScrapped()
    };
}

export {
    createRowFromBookmarkNode
}
