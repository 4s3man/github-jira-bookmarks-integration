const cheerio = require('cheerio');
import {AxiosResponse} from "axios";
import {ITableDemoRow} from "./TableDemo";

interface ISiteScrapperMap {
    name: string,
    matchers: IMatcher[]
}

interface IMatcher {
    path: string,
    callback: (element) => boolean,
    responseType?: 'html'|'json'
}

interface IScrapped {
    isRequestedChanges: boolean,
    isCodeReviewRequired: boolean,
    isBuildError: boolean,
    isChangesApproved: boolean,
    isToCorrect: boolean,
    isReadyToMerge: boolean,
    isInProgress: boolean,
    isInReview: boolean,
    isMerged: boolean,
    isClosed: boolean,
    isDone: boolean
}

interface JiraApiIssueResponse {
    data: {
        fields: {
            status: {
                name: 'Accepted' | 'Blocked' | 'Ready to merge' | 'In Review' | 'Is to Correct' | 'In Progress' | 'Done'
            };
        }
    }
}

class SiteScrapper {
    isBuildErrorPath = 'div[title="This commit cannot be built"]';

    creteMapEntry(name: string, ...matchers: IMatcher[]): ISiteScrapperMap
    {
        const matchersWithDefaults = matchers.map(
            (m) => {
                if (m.responseType === undefined) {
                    m.responseType = 'html';
                }

                return m;
            }
        );

        return {
            name: name,
            matchers: [...matchersWithDefaults]
        }
    }

    enrichRowWithGithubConversation(row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        return this.enrichRow(this.githubConversationMap, row, result);
    }

    enrichRowWithGithubPartial(row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        return this.enrichRow(this.githubPartialMap, row, result);
    }

    enrichRowWithJira(row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        return this.enrichRow(this.jiraMap, row, result);
    }

    enrichRow(map: ISiteScrapperMap[], row: ITableDemoRow, result: AxiosResponse): ITableDemoRow {
        let $ = cheerio.load(result.data);
        for (let i = 0; i < map.length; i++) {
            const current = map[i];
            const scrapped = current.matchers.reduce((a, b) => {
                a[current.name] = b.responseType === "html"
                    ? b.callback($(b.path))
                    : b.callback(result);

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
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'Ready to merge'
                },
                responseType: 'json'
            }
        ),
        this.creteMapEntry(
            'isInProgress',
            {
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'In Progress'
                },
                responseType: 'json'
            }
        ),
        this.creteMapEntry(
            'isToCorrect',
            {
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'Is to Correct'
                },
                responseType: 'json'            }
        ),
        this.creteMapEntry(
            'isInReview',
            {
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'In Review'
                },
                responseType: 'json'
            }
        ),
        this.creteMapEntry(
            'isDone',
            {
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'Done'
                },
                responseType: 'json'
            }
        ),
        this.creteMapEntry(
            'isAccepted',
            {
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'Accepted'
                },
                responseType: 'json'
            }
        ),
        this.creteMapEntry(
            'isBlocked',
            {
                path: '',
                callback: (element: JiraApiIssueResponse) => {
                    return  element.data.fields.status.name === 'Blocked'
                },
                responseType: 'json'
            }
        )
    ];

    githubConversationMap: ISiteScrapperMap[] = [
        this.creteMapEntry(
            'isMerged',
            {
                path: '#partial-discussion-header > div.d-flex.flex-items-center.flex-wrap.mt-0.gh-header-meta > div.flex-shrink-0.mb-2.flex-self-start.flex-md-self-center > span',
                callback: element => {
                    const text = element.text().trim();
                    return text === 'Merged';
                }
            }
        ),
        this.creteMapEntry(
            'isClosed',
            {
                path: '#partial-discussion-header > div.d-flex.flex-items-center.flex-wrap.mt-0.gh-header-meta > div.flex-shrink-0.mb-2.flex-self-start.flex-md-self-center > span',
                callback: element => {
                    const text = element.text().trim();
                    return text === 'Closed';
                }
            }
        ),
    ];

    githubPartialMap: ISiteScrapperMap[] = [
        this.creteMapEntry(
            'isRequestedChanges',
            {
                path: '#partial-pull-merging > div.merge-pr.js-merge-pr.js-details-container.Details.is-squashing > div > div > div > div > div:nth-child(1) > h3',
                callback: element => {
                    const text = element.text().trim();
                    return text === 'Changes requested';
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
