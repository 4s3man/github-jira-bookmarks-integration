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

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

interface ITableDemoProps {
    rows: ITableDemoRows[]
}

interface ITableDemoRows {
    id: string,
    url: string,
    title: string,
    isRequestedChanges: boolean,
    isBuildError: boolean
}

function TableDemo(props: ITableDemoProps) {
    const classes = useStyles();
    const openLink = (event: React.SyntheticEvent, url: string) => {
        event.preventDefault();
        chrome.tabs.create({url});
    };

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="caption table">
                <caption>A basic table example with a caption</caption>
                <TableHead>
                    <TableRow>
                        <TableCell>isRequestedChanges</TableCell>
                        <TableCell>isBuildError</TableCell>
                        <TableCell>Title</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.isRequestedChanges ? '1' : '0'}</TableCell>
                            <TableCell>{row.isBuildError ? '1' : '0'}</TableCell>
                            <TableCell component="th" scope="row">
                                <Link href={row.url} onClick={(event) => openLink(event, row.url)}>
                                    {row.title}
                                </Link>
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
    ITableDemoRows
}
