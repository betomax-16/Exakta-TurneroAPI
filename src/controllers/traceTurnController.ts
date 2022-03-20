import TraceHistory from "../models/traceHistory";
import TraceTurn, { ITraceTurn } from '../models/traceTurn';
import Module from "../models/module";
import moment from "moment";
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";

class TraceController {

    // agragar filtros
    static async getAll(jwt: any, queries: IQueryRequest[]|null = null): Promise<ITraceTurn[]|null> {
        try {
            let myQuery: any = {};
            if (jwt) {
                const { username, rol, sucursal } = jwt;
                let exist: boolean = false;

                if (queries) {
                    queries.forEach(query => {
                        if (query.field === 'sucursal' && rol !== 'Admin') {
                            // query.value = sucursal;
                            exist = true;
                        }
                    });
        
                    myQuery = getQueriesMongo(queries);
    
                    if (!exist && rol !== 'Admin') {
                        myQuery['sucursal'] = sucursal;
                    }
                }
            }
            else {
                if (queries) {
                    myQuery = getQueriesMongo(queries);
                }
            }
            return await TraceTurn.find(myQuery);
        } catch (error) {
            throw error;
        }
    }

    static async get(firstDate: string, lastDate: string): Promise<ITraceTurn[]|null> {
        try {
            let firstD: moment.Moment = moment(firstDate, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            let lastD: moment.Moment = moment(lastDate, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            if (firstD.isValid() && lastD.isValid()) {
                firstD = firstD.hour(0).minute(0).second(0).millisecond(0);
                lastD = lastD.hour(23).minute(59).second(59).millisecond(999);
                return await TraceTurn.find({
                    createdAt: {
                        $gte: firstD.toDate(),
                        $lte: lastD.toDate()
                    }
                });   
            }
            else {
                throw new Error("Some date has no format [yyyy-mm-dd].");
            }
        } catch (error) {
            throw error;
        }
    }

    static async getOne(turn: string, sucursal: string, state: string): Promise<ITraceTurn|null> {
        try {
            return await TraceTurn.findOne({turn: turn, sucursal: sucursal, state: state});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ITraceTurn|any): Promise<ITraceTurn|null> {
        try {
            const newTurnState: ITraceTurn = new TraceTurn(data);    
            return await newTurnState.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(turn: string, sucursal: string, state: string, data: ITraceTurn|any): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            if (data.state && (data.state === 'cancelado' || data.state === 'terminado' || data.state === 're-call')) {
                return await TraceTurn.updateOne({turn: turn, sucursal: sucursal, finalDate: null}, { $set: {finalDate: data.finalDate} });
            }
            else {
                return await TraceTurn.updateOne({turn: turn, sucursal: sucursal, $or: [{state: state}, {rol: 're-call'}], finalDate: null}, { $set: {finalDate: data.finalDate} });
            }
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(turn: string, sucursal: string, state: string): Promise<any|null> {
        try {
            return await TraceTurn.deleteOne({turn: turn, sucursal: sucursal, state: state});
        } catch (error: any) {
            throw error;
        }
    }

    static async migration(): Promise<boolean> {
        try {
            const res = await TraceTurn.find({});
            const query: any[] = [];
            res.forEach(element => {
                const auxItem: any = {};
                auxItem['insertOne'] = {document: element }
                query.push(auxItem);
            });

            await TraceHistory.bulkWrite(query);

            await TraceTurn.bulkWrite([
                { deleteMany: { filter: {} } }  
            ]);
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async logout(): Promise<boolean> {
        try {
            await Module.updateMany({}, {status: false, username: ''});
            return true;
        } catch (error) {
            throw error;
        }
    }
}

export default TraceController;