import TraceHistory, { ITraceHistory } from '../models/traceHistory';
import moment from "moment";
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";

class TraceHistoryController {

    static async get(jwt: any, queries: IQueryRequest[]|null = null): Promise<ITraceHistory[]|null> {
        try {
            let myQuery: any = {};
            const { username, rol, sucursal } = jwt;
            let exist: boolean = false;
            
            if (queries) {
                queries.forEach(query => {
                    if (query.field === 'sucursal' && rol !== 'Admin') {
                        query.value = sucursal;
                        exist = true;
                    }
                });
    
                if (!exist && rol !== 'Admin') {
                    queries.push({
                        field: 'sucursal',
                        oparator: '=',
                        value: sucursal
                    });
                }
    
                myQuery = getQueriesMongo(queries);
            }

            return await TraceHistory.find(myQuery); 

            // let firstD: moment.Moment = moment(firstDate, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            // let lastD: moment.Moment = moment(lastDate, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            // if (firstD.isValid() && lastD.isValid()) {
            //     firstD = firstD.hour(0).minute(0).second(0).millisecond(0);
            //     lastD = lastD.hour(23).minute(59).second(59).millisecond(999);
                
            //     return await TraceHistory.find({
            //         sucursal: sucursal,
            //         createdAt: {
            //             $gte: firstD.toDate(),
            //             $lte: lastD.toDate()
            //         }
            //     });   
            // }
            // else {
            //     throw new Error("Some date has no format [yyyy-mm-dd].");
            // }
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ITraceHistory): Promise<ITraceHistory|null> {
        try {
            const newTurnState: ITraceHistory = new TraceHistory(data);    
            return await newTurnState.save();
        } catch (error) {
            throw error;
        }
    }

    static async deleteFrom(date: string): Promise<any> {
        try {
            let dateIndex: moment.Moment = moment(date, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            if (dateIndex.isValid()) {
                dateIndex = dateIndex.hour(23).minute(59).second(59).millisecond(999);
                return await TraceHistory.deleteMany({ creationDate: { $lte: dateIndex.toDate() } });
            }
            else {
                throw new Error("The date has no format [yyyy-mm-dd].");
            }
        } catch (error: any) {
            throw error;
        }
    }
}

export default TraceHistoryController;