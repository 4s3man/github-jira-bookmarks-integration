import * as React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import Alert, { Color } from '@material-ui/lab/Alert';
import {ReactNode} from "react";

import {IScrapped} from "./SiteScrapper";
import {createJiraUrl} from "./urlFactory";

const useStyles = makeStyles({
    table: {
        width: "100%",
        overflow: "scroll"
    },
});

interface ITableDemoProps {
    rows: ITableDemoRow[]
}

interface ITableDemoRow {
    id: string,
    url: string,
    title: string
    scrapped: IScrapped
}

function TableDemo(props: ITableDemoProps) {
    const classes = useStyles();
    const openLink = (event: React.SyntheticEvent, url: string) => {
        event.preventDefault();
        chrome.tabs.create({url});
    };
    const createAlerts = (row: ITableDemoRow): ReactNode => {
        return Object.entries(row.scrapped).map((entry, i) => {
            const key = `${row.id}_${entry[0]}_${i}`;
            if (!entry[1]) {
                return (<template key={key}/>);
            }

            const severityMap = {
                isRequestedChanges: "error",
                isCodeReviewRequired: "warning",
                isBuildError: "error",
                isChangesApproved: "success"
            };

            return (
                <Alert key={key} severity={severityMap[entry[0]] || 'info'}>
                    {entry[0]}
                </Alert>
            );
        });
    }
    const getMainSeverity = (scrapped: IScrapped): Color => {
        if (scrapped.isBuildError) {
            return "error"
        }

        if (scrapped.isChangesApproved && !scrapped.isCodeReviewRequired) {
            return "success";
        }

        return "warning";
    }

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="caption table">
                <caption>A basic table example with a caption</caption>
                <TableHead>
                    <TableRow>
                        <TableCell>Alerts</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>jiraUrl</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.rows.map((row, i) => (
                        <TableRow key={`${row.id}_${i}`}>
                            <TableCell>
                                {createAlerts(row)}
                            </TableCell>
                            <TableCell component="th" scope="row">
                                <Alert severity={getMainSeverity(row.scrapped)}>
                                    <Link href={row.url} onClick={(event) => openLink(event, row.url)}>
                                        {row.title}
                                    </Link>
                                </Alert>
                            </TableCell>
                            <TableCell>
                                <Alert severity={"info"}>
                                    <Link href={row.url} onClick={(event) => openLink(event, createJiraUrl(row))}>
                                        jira link
                                    </Link>
                                </Alert>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export {
    TableDemo,
    ITableDemoProps,
    ITableDemoRow
}
