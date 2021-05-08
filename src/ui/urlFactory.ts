import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {ITableDemoRow} from "./TableDemo";

function createJiraUrl(node: BookmarkTreeNode|ITableDemoRow): string {
    const jiraNumber = node.title.split(' ').reverse().pop();
    return `https://pragmagotech.atlassian.net/browse/${jiraNumber}`;
}

export {
    createJiraUrl
}
