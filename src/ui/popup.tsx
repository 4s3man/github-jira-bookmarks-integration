import * as React from "react"
import * as ReactDOM from "react-dom"
import axios from "axios";
import * as cheerio from 'cheerio';
import {Button, Card, CardActions, CardContent} from "@material-ui/core";

import "../styles/popup.css"
import searchTree from "./searchTree";
import { TableDemo, ITableDemoRows, ITableDemoProps } from "./TableDemo";
import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface IProps {
}

interface IState {
    bookmarkNode?: BookmarkTreeNode,
    rows: Array<ITableDemoRows>
}

class Hello extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            bookmarkNode: null,
            rows: []
        };
    }

    componentDidMount() {
        chrome.bookmarks.getTree(bookmarkTreeNodes => {
            const githubBookmarkNodes = searchTree(
                (treeNode: BookmarkTreeNode) => treeNode.title === 'current' && treeNode.children.length,
                (treeNode: BookmarkTreeNode) => treeNode.children,
                bookmarkTreeNodes
            );

            githubBookmarkNodes.children.forEach(
                (node: BookmarkTreeNode) => axios.get(node.url)
                    .then((result) => {
                        const map = [
                            {
                                name: 'isRequestedChanges',
                                matchers: [
                                    {
                                        path: '#partial-pull-merging > div.merge-pr.js-merge-pr.js-details-container.Details.is-squashing > div > div > div > div > div:nth-child(1) > h3',
                                        callback: (element => {
                                            const text = element.text().trim();
                                            return text === 'Changes requested' || text === 'Changes requested';
                                        })
                                    }
                                ]
                            }
                        ];

                        let row = {
                            id: node.id,
                            title: node.title,
                            url: node.url,
                            isRequestedChanges: false,
                            isBuildError: false
                        };

                        let $ = cheerio.load(result.data);
                        for (let i = 0; i < map.length; i++) {
                            const current = map[i];
                            const scrapped = current.matchers.reduce((a,b)=>{
                                a[current.name] = b.callback($(b.path));

                                return a;
                            }, {});
                            row = {...row, ...scrapped};
                        }

                        const state = {
                            bookmarkNode: this.state.bookmarkNode,
                            rows: [...this.state.rows, ...[row]]
                        };

                        this.setState(state);
                    })
            );

            this.setState({
                bookmarkNode: githubBookmarkNodes,
                rows: this.state.rows
            });
        });
    }

    openAllBookmarksInNewWindow(): void {
        let urls = this.state.bookmarkNode.children.map((node: BookmarkTreeNode) => node.url);
        let firstUrl = urls.pop();
        chrome.windows.create(
            {url: firstUrl},
            (window) => urls.forEach(url => chrome.tabs.create({url, windowId: window.id}))
        );
    }

    render() {
        return (
            <Card>
                <CardActions>
                    <Button
                        onClick={() => this.openAllBookmarksInNewWindow()}
                        variant="contained"
                        color="primary"
                    >
                        { chrome.i18n.getMessage("openAll") }
                    </Button>
                </CardActions>
                <CardContent style={{ height: 300, width: '100%' }}>
                    <TableDemo rows={this.state.rows}/>
                </CardContent>
            </Card>
        )
    }
}

ReactDOM.render(
    <Hello />,
    document.getElementById('root')
)
