import * as React from "react"
import * as ReactDOM from "react-dom"
import axios from "axios";
import {Button, Card, CardActions, CardContent} from "@material-ui/core";

import "../styles/popup.css"
import searchTree from "./searchTree";
import { TableDemo, ITableDemoRow, ITableDemoProps } from "./TableDemo";
import {scrapper} from "./SiteScrapper";
import {createRowFromBookmarkNode} from "./tableRowFactory";

import BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;
import {createJiraUrl} from "./urlFactory";

interface IProps {
}

interface IState {
    bookmarkNode?: BookmarkTreeNode,
    rows: Array<ITableDemoRow>
}

class Hello extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            bookmarkNode: null,
            rows: []
        };
    }

    //todo dodać żeby odpalało się w tle co 10 minut i zapisywało te dane do localStorage czy coś
    //i żeby na otwarcie popupa się updatowało
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
                        let row = scrapper.enrichRowWithGithub(createRowFromBookmarkNode(node), result);

                        axios.get(createJiraUrl(node)).then(result => {
                           row = scrapper.enrichRowWithJira(row, result);
                            console.log(row);
                            this.setState({
                                bookmarkNode: this.state.bookmarkNode,
                                rows: [...this.state.rows, ...[row]]
                            });
                        });
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
            <Card style={{overflowY: "scroll", overflowX: "hidden"}}>
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
