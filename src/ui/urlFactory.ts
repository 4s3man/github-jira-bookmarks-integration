import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {ITableDemoRow} from "./TableDemo";

class UrlFactory {
    createGithubConversationUrl(node: BookmarkTreeNode|ITableDemoRow): string {
        return `${node.url}`;
    }

    createJiraUrl(node: BookmarkTreeNode|ITableDemoRow): string {
        const jiraNumber = node.title.split(' ').reverse().pop();
        return `https://pragmagotech.atlassian.net/browse/${jiraNumber}`;
    }

    createGithubShowPartialState(node: BookmarkTreeNode) {
        return `${node.url}/show_partial?partial=pull_requests%2Fmerging`;
    }
}

const urlFactory = new UrlFactory();

export {urlFactory};