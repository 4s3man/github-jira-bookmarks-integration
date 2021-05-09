import * as React from "react"
import * as ReactDOM from "react-dom"
import {Button, Card, CardActions, CardContent} from "@material-ui/core";

import "../styles/popup.css"
import { TableDemo, ITableDemoRow } from "./TableDemo";
import {RowRepository} from "./RowRepository";
import {isForCodeReview} from "./scrappedInterpreter";

interface IProps {
}

interface IState {
    rows: Array<ITableDemoRow>
}

class Hello extends React.Component<IProps, IState> {
    rowRepository;
    constructor(props) {
        super(props);
        this.state = {
            rows: []
        };
        this.rowRepository = new RowRepository((rows) => this.setState({rows}), () => this.state);
    }

    componentDidMount() {
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
                </CardActions>
                <CardContent style={{   width: "100%"}}>
                    <TableDemo
                        rows={this.state.rows}
                        rowRepository={this.rowRepository}
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
