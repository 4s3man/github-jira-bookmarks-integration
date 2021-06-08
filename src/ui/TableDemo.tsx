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
import Box from '@material-ui/core/Box';

import {IScrapped} from "./SiteScrapper";
import {createJiraUrl} from "./urlFactory";
import {Button} from "@material-ui/core";
import {RowRepository} from "./RowRepository";
import {prop} from "cheerio/lib/api/attributes";
import Tab = chrome.tabs.Tab;
import {log} from "util";

const useStyles = makeStyles({
    table: {
        width: "100%"
    },
});

interface ITableDemoProps {
    rows: ITableDemoRow[],
    rowRepository: RowRepository,
    searchTerm: string
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
        chrome.tabs.query({}, (tabs: Tab[]) => {
            const tab = tabs.find((tab: Tab) => tab.url === url);
            tab ? chrome.tabs.update(tab.id, {active: true})
                : chrome.tabs.create({url})
        });
    };

    const unwatch = (event: React.SyntheticEvent, row: ITableDemoRow) => {
        event.preventDefault();
        chrome.bookmarks.remove(row.id);
        props.rowRepository.updateRows();
    }

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

    const filteredRows = () => {
        return props.rows.filter((row: ITableDemoRow) => {
            for (const [key, value] of Object.entries(row.scrapped)) {
                if (!!value && key.includes(props.searchTerm)) {
                    return true;
                }
            }

            return row.title.toLowerCase().includes(props.searchTerm);
        })
    }

    return (
        <TableContainer component={Paper} style={{width:"100%", overflowX: "hidden"}}>
            <Table className={classes.table} aria-label="caption table">
                <TableHead>
                    <TableRow>
                        <TableCell>{ chrome.i18n.getMessage("actions") }</TableCell>
                        <TableCell>{ chrome.i18n.getMessage("alerts") }</TableCell>
                        <TableCell>{ chrome.i18n.getMessage("title") }</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredRows().map((row, i) => (
                        <TableRow key={`${row.id}_${i}`}>
                            <TableCell >
                                <Box
                                    display="flex"
                                    flexWrap="wrap"
                                    alignContent="flex-center"
                                    justifyContent="space-between"
                                >
                                    <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={(event) => openLink(event, createJiraUrl(row))}
                                    >
                                        { chrome.i18n.getMessage("jiraLink") }
                                    </Button>
                                </Box>
                            </TableCell>
                            <TableCell>
                                {createAlerts(row)}
                            </TableCell>
                            <TableCell>
                                <Alert severity={getMainSeverity(row.scrapped)}>
                                    <Link href={row.url} onClick={(event) => openLink(event, row.url)}>
                                        {row.title}
                                    </Link>
                                </Alert>
                            </TableCell>
                            <TableCell>
                                <div
                                    style={{backgroundColor:"lightyellow", cursor:"pointer", padding:"1em"}}
                                    onClick={(event) => unwatch(event, row)}
                                >
                                    { chrome.i18n.getMessage("unwatch") }
                                </div>
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
