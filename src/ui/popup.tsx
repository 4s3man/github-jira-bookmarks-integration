import * as React from "react"
import * as ReactDOM from "react-dom"
import {Button, Card, CardActions, CardContent, Input} from "@material-ui/core";
import SearchInput, {createFilter} from 'react-search-input'

import "../styles/popup.css"
import { TableDemo, ITableDemoRow } from "./TableDemo";
import {RowRepository} from "./RowRepository";
import {isForCodeReview} from "./scrappedInterpreter";
import {clearSpecification} from "./ClearSpecification";

interface IProps {
}

interface IState {
    rows: Array<ITableDemoRow>,
    searchTerm: string
}

class Hello extends React.Component<IProps, IState> {
    rowRepository;
    searchInput;
    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            searchTerm: ''
        };
        this.rowRepository = new RowRepository(
            (rows) => this.setState({
                rows: [...rows],
                searchTerm: this.state.searchTerm
            }),
            () => this.state
        );
    }

    componentDidMount() {
        document.addEventListener('keypress', (e) => this.updateSearchTerm(e), false);
        this.rowRepository.persistState(this.rowRepository.fetchRows());
        this.rowRepository.updateRows();
    }

    openAllBookmarksInNewWindow(): void {
        let urls = this.state.rows.map((row: ITableDemoRow) => row.url);
        let firstUrl = urls.shift();
        chrome.windows.create(
            {url: firstUrl},
            (window) => urls.forEach(url => chrome.tabs.create({url, windowId: window.id}))
        );
    }

    copyCrRequestLinks() {
        navigator.clipboard.writeText(this.state.rows.filter(row => isForCodeReview(row.scrapped)).map(row => row.url).join("\n"));
    }

    updateSearchTerm(e) {
        this.searchInput.focus();
        this.setState({
            rows: this.state.rows,
            searchTerm: this.searchInput.value
        });
    }

    clear() {
        this.state.rows.map((row: ITableDemoRow) => row.url);
        this.state.rows.forEach(
            (row: ITableDemoRow) => clearSpecification.shouldClear(row) && chrome.bookmarks.remove(row.id)
        );
        this.rowRepository.updateRows();
    }

    render() {
        return (
            <Card style={{overflowY: "scroll", overflowX: "scroll"}}>
                <CardActions
                    style={{display:"flex", flexFlow:"column"}}
                >
                    <div>
                        <Button
                            onClick={() => this.openAllBookmarksInNewWindow()}
                            variant="contained"
                            color="primary"
                        >
                            { chrome.i18n.getMessage("openAll") }
                        </Button>
                        <Button
                            onClick={() => this.rowRepository.updateRows()}
                            variant="contained"
                            color="primary"
                        >
                            { chrome.i18n.getMessage("updateRows") }
                        </Button>
                        <Button
                            onClick={() => this.copyCrRequestLinks()}
                            variant="contained"
                            color="primary"
                        >
                            { chrome.i18n.getMessage("copyCrRequestLink") }
                        </Button>
                        <Button
                            onClick={() => this.clear()}
                            variant="contained"
                            color="secondary"
                        >
                            { chrome.i18n.getMessage("clear") }
                        </Button>
                    </div>
                    <div>
                        <input
                            className="search-input"
                            ref={(input)=>this.searchInput = input}
                            onChange={(e) => this.updateSearchTerm(e)}
                        />
                    </div>
                </CardActions>
                <CardContent style={{ width: "100%"}}>
                    <TableDemo
                        rows={this.state.rows}
                        rowRepository={this.rowRepository}
                        searchTerm={this.state.searchTerm}
                    />
                </CardContent>
            </Card>
        )
    }
}

ReactDOM.render(
    <Hello />,
    document.getElementById('root')
)

export {
    IState
}

function GetDescriptionFor(e)
{
    var result, code;

    result = e.keyCode;

    return String.fromCharCode(code);
}

function MonitorKeyPress(e: Event)
{
    if (!e) e=window.event;
    var d = GetDescriptionFor(e);
    console.log(d);
    return false;
}
