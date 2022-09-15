import moment from "moment-timezone";
import { getEnv } from "../../enviroment";

export interface IQueryRequest {
    field: string; 
    value: string;
    oparator: string;
    logicOperator?: string;
}

export function diacriticSensitiveRegex(string: string): string {
    return string.replace(/[a|A]/g, '[a,á,à,ä,â]')
       .replace(/[e|E]/g, '[e,é,ë,è,ê]')
       .replace(/[i|I]]/g, '[i,í,ï,ì,î]')
       .replace(/[o|O]/g, '[o,ó,ö,ò,ô]')
       .replace(/[u|U]/g, '[u,ü,ú,ù,û]');
}

function getValue(query: IQueryRequest, isEqual: boolean = false): any {
    getEnv();
    const {TZ} = process.env;
    let res: any = '';
    const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;
    const formatDate2 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])$/;
    const formatDate3 = /^(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9])$/;
    
    if (Number(query.value)) {
        res = query.value;
    }
    else if (formatDate1.test(query.value) && moment(query.value).tz(TZ||'America/Mexico_City').isValid()) {
        res = moment(query.value).tz(TZ||'America/Mexico_City').hour(0).minute(0).second(0).millisecond(0).toDate();
    }
    else if (formatDate2.test(query.value) && moment(query.value).tz(TZ||'America/Mexico_City').isValid()) {
        res = moment(query.value).tz(TZ||'America/Mexico_City').second(0).millisecond(0).toDate();
    }
    else if (formatDate3.test(query.value)) {
        const hour: number = parseInt(query.value.split(':')[0]);
        const minute: number = parseInt(query.value.split(':')[1]);
        res = moment().tz(TZ||'America/Mexico_City').hour(hour).minute(minute).second(0).millisecond(0).toDate();
    }
    else if (query.value.toLowerCase() === 'null') {
        res = { "$in": [ null, "" ] };
    }
    else {
        const regex = /^\d/;
        if (!regex.test(query.value) && query.oparator !== 'ne') {
            let str = diacriticSensitiveRegex(query.value);
            str = isEqual ? `^${str}$` : str;
            res = { $regex: str, $options: "i" };
        }
        else {
            res = query.value;
        }
    }

    return res;
}

function nested(query: IQueryRequest, myQuery: any, value: any): any[] {
    let auxQuery: any = {...myQuery};
    if (query.field !== 'limit' && query.field !== 'skip') {
        if (query.logicOperator !== undefined) {
            const subQuery: any = {...auxQuery};
            if (query.logicOperator === 'and') {
                const item: any = {};
                item[query.field] = value;
                auxQuery = {$and:[subQuery, item]};
            }
            else {
                const item: any = {};
                item[query.field] = value;
                auxQuery = {$or:[subQuery, item]};
            }
        }
        else {
            auxQuery[query.field] = value;
        }
    }

    return auxQuery;
}

export function getQueriesMongo(queries: IQueryRequest[]|null): any {
    let myQuery: any = {};
    if (queries && queries.length > 0) {
        queries.forEach(query => {
            switch (query.oparator) {
                case 'in':
                    myQuery = nested(query, myQuery, getValue(query));
                    break;
                case 'eq':
                    myQuery = nested(query, myQuery, getValue(query, true));
                    break;
                case 'ne':
                    myQuery = nested(query, myQuery, { $ne: getValue(query) });
                    break;
                case 'gte':
                    myQuery = nested(query, myQuery, { $gte: getValue(query) });
                    break;
                case 'lte':
                    myQuery = nested(query, myQuery, { $lte: getValue(query) });
                    break;
                case 'gt':
                    myQuery = nested(query, myQuery, { $gt: getValue(query) });
                    break;
                case 'lt':
                    myQuery = nested(query, myQuery, { $lt: getValue(query) });
                    break;
                default:
                    break;
            }
        });
    }
    
    return myQuery;
}

export function getQueries(req: any): IQueryRequest[]{
    const auxQueries: IQueryRequest[] = [];
    
    for (const key in req.query) {
        const auxData: any = req.query[key];

        if (Array.isArray(auxData)) {
            auxData.forEach(element => {
                const data: string[] = element.toString().split('|');
                let objt: IQueryRequest = {
                    field: '',
                    oparator: '',
                    value: ''
                };

                if (data.length === 2) {
                    objt = {
                        field: key,
                        value: data[0],
                        oparator: data[1]
                    };
                }
                if (data.length === 3) {
                    objt = {
                        field: key,
                        value: data[0],
                        oparator: data[1],
                        logicOperator: data[2]
                    };
                }
                auxQueries.push(objt);
            });
        }
        else {
            const data: string[] = auxData.toString().split('|');
            let objt: IQueryRequest = {
                    field: '',
                    oparator: '',
                    value: ''
            };

            if (data.length === 2) {
                objt = {
                    field: key,
                    value: data[0],
                    oparator: data[1]
                };
            }
            if (data.length === 3) {
                objt = {
                    field: key,
                    value: data[0],
                    oparator: data[1],
                    logicOperator: data[2]
                };
            }
            auxQueries.push(objt);
        }
    }

    return auxQueries;
}