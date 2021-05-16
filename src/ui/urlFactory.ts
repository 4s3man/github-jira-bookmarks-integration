import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {ITableDemoRow} from "./TableDemo";

function createJiraUrl(node: BookmarkTreeNode|ITableDemoRow): string {
    const jiraNumber = node.title.split(' ').reverse().pop();
    return `https://pragmagotech.atlassian.net/browse/${jiraNumber}`;
}

function createGithubShowPartialState(node: BookmarkTreeNode) {
    return `${node.url}/show_partial?partial=pull_requests%2Fmerging`;
}

export {
    createJiraUrl,
    createGithubShowPartialState
}
