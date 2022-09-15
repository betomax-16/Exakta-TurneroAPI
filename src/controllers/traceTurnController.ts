import TraceHistory from "../models/traceHistory";
import TraceTurn, { ITraceTurn } from '../models/traceTurn';
import Module from "../models/module";
import moment from "moment-timezone";
import {ClientSession} from "mongoose";
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";
import { getEnv } from "../enviroment";

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
            getEnv();
            const {TZ} = process.env;
            let firstD: moment.Moment = moment(firstDate, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            let lastD: moment.Moment = moment(lastDate, ["MM-DD-YYYY", "YYYY-MM-DD"]);
            if (firstD.isValid() && lastD.isValid()) {
                firstD = firstD.tz(TZ||'America/Mexico_City').hour(0).minute(0).second(0).millisecond(0);
                lastD = lastD.tz(TZ||'America/Mexico_City').hour(23).minute(59).second(59).millisecond(999);
                return await TraceTurn.find({
                    createdAt: {
                        $gte: firstD.toDate(),
                        $lte: lastD.toDate()
                    }
                });   
            }
            else {
                throw new Error("Alguna fecha no tiene el formato: [yyyy-mm-dd].");
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

    static async create(data: ITraceTurn|any, session?: ClientSession): Promise<any|null> {
        try {
            const result = await TraceTurn.create([{...data}], { session });
            return result[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(turn: string, sucursal: string, state: string, data: ITraceTurn|any, session?: ClientSession): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            if (data.state && (data.state === 'cancelado' || data.state === 'terminado' || data.state === 're-call')) {
                return await TraceTurn.updateOne({turn: turn, sucursal: sucursal, finalDate: null}, { $set: {finalDate: data.finalDate} }, {session});
            }
            else {
                return await TraceTurn.updateOne({turn: turn, sucursal: sucursal, $or: [{state: state}, {rol: 're-call'}], finalDate: null}, { $set: {finalDate: data.finalDate} }, {session});
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

    static async migration(sucursal?: string): Promise<boolean> {
        try {
            const querySuc = sucursal ? {sucursal: sucursal} : {};
            const res = await TraceTurn.find(querySuc);
            const query: any[] = [];
            res.forEach(element => {
                const auxItem: any = {};
                auxItem['insertOne'] = {document: element }
                query.push(auxItem);
            });

            await TraceHistory.bulkWrite(query);

            await TraceTurn.bulkWrite([
                { deleteMany: { filter: querySuc } }  
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