import * as React from "react"
import * as ReactDOM from "react-dom"
import {Button, Card, CardActions, CardContent} from "@material-ui/core";

import "../styles/popup.css"
import { TableDemo, ITableDemoRow } from "./TableDemo";
import {RowRepository} from "./RowRepository";

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
                </CardActions>
                <CardContent style={{ height: 300, width: '100%', overflowX: "hidden" }}>
                    <TableDemo rows={this.state.rows} rowRepository={this.rowRepository}/>
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
