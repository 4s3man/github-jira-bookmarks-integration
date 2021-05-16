import {log} from "util";

const cheerio = require('cheerio');
import {AxiosResponse} from "axios";
import {ITableDemoRow} from "./TableDemo";

interface ISiteScrapperMap {
    name: string,
    matchers: IMatcher[]
}

interface IMatcher {
    path: string,
    callback: (element) => boolean
}

interface IScrapped {
    isRequestedChanges: boolean,
    isCodeReviewRequired: boolean,
    isBuildError: boolean,
    isChangesApproved: boolean,
    isToCorrect: boolean,
    isReadyToMerge: boolean,
    isInProgress: boolean,
    isInReview: boolean
}

class SiteScrapper {
    isBuildErrorPath = 'div[title="This commit cannot be built"]';

    creteMapEntry(name: string, ...matchers: IMatcher[]): ISiteScrapperMap
    {
        return {
            name: name,
            matchers: [...matchers]
        }
    }

    enrichRowWithGithub(row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        return this.enrichRow(this.githubMap, row, result);
    }

    enrichRowWithJira(row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        return this.enrichRow(this.jiraMap, row, result);
    }

    enrichRow(map: ISiteScrapperMap[], row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        let $ = cheerio.load(result.data);
        for (let i = 0; i < map.length; i++) {
            const current = map[i];
            const scrapped = current.matchers.reduce((a, b) => {
                a[current.name] = b.callback($(b.path));

                return a;
            }, {});

            row.scrapped = {...row.scrapped, ...scrapped}
        }

        return row;
    }

    jiraMap: ISiteScrapperMap[] = [
        this.creteMapEntry(
            'isReadyToMerge',
            {
                path: "div[data-test-id='issue.views.issue-base.foundation.status.status-field-wrapper']>div>div>div>div>button>span",
                callback: element => {
                    const text = element.text().trim().toLowerCase();
                    return text === 'ready to merge';
                }
            }
        ),
        this.creteMapEntry(
            'isInProgress',
            {
                path: "div[data-test-id='issue.views.issue-base.foundation.status.status-field-wrapper']>div>div>div>div>button>span",
                callback: element => {
                    const text = element.text().trim().toLowerCase();
                    return text === 'in progress' || text === 'w toku';
                }
            }
        ),
        this.creteMapEntry(
            'isToCorrect',
            {
                path: "div[data-test-id='issue.views.issue-base.foundation.status.status-field-wrapper']>div>div>div>div>button>span",
                callback: element => {
                    const text = element.text().trim().toLowerCase();
                    return text === 'to correct';
                }
            }
        ),
        this.creteMapEntry(
            'isInReview',
            {
                path: "div[data-test-id='issue.views.issue-base.foundation.status.status-field-wrapper']>div>div>div>div>button>span",
                callback: element => {
                    const text = element.text().trim().toLowerCase();
                    return text === 'in review';
                }
            }
        )
    ];

    githubMap: ISiteScrapperMap[] = [
        this.creteMapEntry(
            'isRequestedChanges',
            {
                path: '#partial-pull-merging > div.merge-pr.js-merge-pr.js-details-container.Details.is-squashing > div > div > div > div > div:nth-child(1) > h3',
                callback: element => {
                    const text = element.text().trim();
                    return text === 'Code owner review required';
                }
            }
        ),
        this.creteMapEntry(
            'isCodeReviewRequired',
            {
                path: '#partial-pull-merging > div.merge-pr.js-merge-pr.js-details-container.Details.is-squashing > div > div > div > div > div:nth-child(1) > h3',
                callback: element => {
                    const text = element.text().trim();
                    return text === 'Code owner review required';
                }
            }
        ),
        this.creteMapEntry(
            'isBuildError',
            {
                path: this.isBuildErrorPath,
                callback: element => {
                    return element.text().trim().indexOf('This commit cannot be built') !== -1;
                }
            }
        ),
        this.creteMapEntry(
            'isChangesApproved',
            {
                path: '#partial-pull-merging > div.merge-pr.js-merge-pr.js-details-container.Details.is-squashing > div > div > div > div > div:nth-child(1) > h3',
                callback: element => {
                    const text = element.text().trim();
                    return text === 'Changes approved';
                }
            }
        )
    ];
}

const scrapper = new SiteScrapper();

export{
    IScrapped,
    ISiteScrapperMap,
    IMatcher,
    scrapper
}
