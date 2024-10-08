import "../styles/popup.css"
import { ITableDemoRow } from "./TableDemo";
import searchTree from "./searchTree";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import axios from "axios";
import {scrapper} from "./SiteScrapper";
import {urlFactory} from "./urlFactory";
import {createRowFromBookmarkNode} from "./tableRowFactory";
import {saveRows, fetchRows} from "./localStorageRepository";

export class RowRepository {
    additionalPersist;
    additionalFetch;
    constructor(additionalPersist, additionalFetch) {
        this.additionalPersist = additionalPersist;
        this.additionalFetch = additionalFetch;
    }

    removeCurrentlyNotBookmarked() {
        chrome.bookmarks.getTree(bookmarkTreeNodes => {
            const githubBookmarkNodes = searchTree(
                (treeNode: BookmarkTreeNode) => treeNode.title === 'current' && treeNode.children.length,
                (treeNode: BookmarkTreeNode) => treeNode.children,
                bookmarkTreeNodes
            ).children;

            const actualRows = this.fetchRows().filter(oldRow => githubBookmarkNodes.find(node => node.id === oldRow.id));
            this.persistState(actualRows);
        });
    }

    updateRows() {
        this.removeCurrentlyNotBookmarked();
        chrome.bookmarks.getTree(bookmarkTreeNodes => {
            const githubBookmarkNodes = searchTree(
                (treeNode: BookmarkTreeNode) => treeNode.title === 'current' && treeNode.children.length,
                (treeNode: BookmarkTreeNode) => treeNode.children,
                bookmarkTreeNodes
            ).children;

            githubBookmarkNodes.forEach(bookmarkNode => {
                axios.get(urlFactory.createGithubConversationUrl(bookmarkNode))
                    .then(result => {
                            this.persistState([
                                ...this.fetchRowsWithoutCurrent(bookmarkNode),
                                scrapper.enrichRowWithGithubConversation(this.provideRow(bookmarkNode), result),
                            ])
                        }
                    );

                axios.get(urlFactory.createGithubShowPartialState(bookmarkNode))
                    .then(result => {
                            this.persistState([
                                ...this.fetchRowsWithoutCurrent(bookmarkNode),
                                scrapper.enrichRowWithGithubPartial(this.provideRow(bookmarkNode), result),
                            ])
                        }
                    );

                axios.get(urlFactory.createApiJiraUrl(bookmarkNode))
                    .then(result => {
                            this.persistState([
                                ...this.fetchRowsWithoutCurrent(bookmarkNode),
                                scrapper.enrichRowWithJira(this.provideRow(bookmarkNode), result)
                            ])
                        }
                    );
            });
        });
    }

    fetchRowsWithoutCurrent(current: BookmarkTreeNode): ITableDemoRow[] {
        return this.fetchRows().filter(element => element.id !== current.id);
    }

    provideRow(node: BookmarkTreeNode): ITableDemoRow {
        return this.fetchRows().find(row => node.id === row.id) || createRowFromBookmarkNode(node);
    }

    persistState(rows: ITableDemoRow[]): void {
        rows.sort((a, b) => a.id > b.id ? 1 : -1);
        this.additionalPersist(rows);
        saveRows(rows);
    }

    fetchRows(): ITableDemoRow[] {
        const localStorageRows = fetchRows();
        if (Array.isArray(localStorageRows)) {
            return localStorageRows;
        }

        const reactStateRows = this.additionalFetch();
        if (Array.isArray(reactStateRows)) {
            return reactStateRows;
        }

        return [];
    }
}
