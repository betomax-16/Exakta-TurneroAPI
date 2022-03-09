import moment from "moment";
import Turn, { ITurn } from '../models/turn';
import TurnHistory from "../models/turnHistory";
import Trace, { ITraceTurn } from "../models/traceTurn";
import areaController from "../controllers/areaController";
import traceTurnController from "../controllers/traceTurnController";
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";
import moduleController from "../controllers/moduleController";
import modulePrivilegeController from "../controllers/modulePrivilegeController";
import areaSucursalController from "../controllers/areaSucursalController";
import { IAreaSucursal } from "../models/areaSucursal";

class TurnController {

    // agregar filtros
    static async getAll(jwt: any, queries: IQueryRequest[]|null = null): Promise<ITurn[]|null> {
        try {
            let myQuery: any = {};
            const { username, rol, sucursal } = jwt;
            let exist: boolean = false;
            let skip: any|null = null;
            let limit: any|null = null;

            if (queries) {
                queries.forEach(query => {
                    if (query.field === 'sucursal' && rol !== 'Admin') {
                        // query.value = sucursal;
                        exist = true;
                    }

                    if (query.field === 'skip') {
                        skip = query;
                    }

                    if (query.field === 'limit') {
                        limit = query;
                    }
                });
    
                myQuery = getQueriesMongo(queries);

                if (!exist && rol !== 'Admin') {
                    myQuery['sucursal'] = sucursal;
                }
            }

            return await Turn.find(myQuery);
        } catch (error: any) {
            throw error;
        }
    }

    static async get(turn: string, sucursal: string): Promise<ITurn|null> {
        try {
            return await Turn.findOne({turn: turn, sucursal: sucursal});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ITurn|any): Promise<ITurn|null> {
        try {
            const newArea: ITurn = new Turn(data);    
            return await newArea.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(turn: string, sucursal: string, data: ITurn|any): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        const auxTurn: any = data;
        delete auxTurn.turn;
        delete auxTurn.area;
        delete auxTurn.creationDate;
        delete auxTurn.sucursal;

        try {
            return await Turn.updateOne({turn: turn, sucursal: sucursal}, { $set: auxTurn });
        } catch (error: any) {
            throw error;
        }
    }

    static async updateArea(area: string, newArea: string): Promise<any|null> {
        try {
            return await Turn.updateMany({area: area}, { $set: {area: newArea} });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(): Promise<ITurn|null> {
        try {
            return await Turn.remove({});
        } catch (error: any) {
            throw error;
        }
    }

    private static async createTrace(oldState: string, trace: ITraceTurn|any): Promise<any|null> {
        try {
            const result = await TurnController.update(trace.turn, trace.sucursal, {state: trace.state});
            if ((result.modifiedCount && result.modifiedCount == 1) || trace.state === 're-call') {
                const dateTrace = moment().toDate();
                const data: any = { finalDate: dateTrace, state: trace.state };

                const res = await traceTurnController.update(trace.turn, trace.sucursal, oldState, data);
                
                let traceRes: any = {};
                if (res.modifiedCount == 1) {
                    trace.startDate = dateTrace;
                    if (trace.state === 'cancelado' || trace.state === 'terminado') {
                        trace.finalDate = dateTrace;
                        trace.ubication = 'salida';
                    }
                    traceRes = await traceTurnController.create(trace);   
                }

                const turn = await TurnController.get(trace.turn, trace.sucursal);
                return {
                    turn: turn,
                    trace: traceRes
                }
            }
            else {
                throw new Error("No update state");
            }
        } catch (error: any) {
            throw error;
        }
    }

    static async takeNewTurn(area: string, sucursal: string): Promise<any|null> {
        try {
            let next: string;
            const lastTurn = await Turn.aggregate([
                { $lookup: {
                             from: "areas",
                             localField: "area",
                             foreignField: "name",
                             as: "data-area"
                           }
                },
                { $match: { sucursal: sucursal, area: area } },
                { $unwind: "$data-area" },
                { $sort: { createdAt: -1 } },
                { $limit: 1 },
                { $project : { 
                    "_id": 1,
                    "turn": 1,
                    "area": 1,
                    "state": 1,
                    "sucusrsal": 1,
                    "prefix": "$data-area.prefix"
                }}
            ]);

            if (lastTurn.length) {
                let number: number = +lastTurn[0].turn.replace(lastTurn[0].prefix, '') + 1;
                if (number < 10) {
                    next = lastTurn[0].prefix +'00' + number;
                }
                else if (number < 100) {
                    next = lastTurn[0].prefix + '0' + number;
                }
                else {
                    next = lastTurn[0].prefix + number.toString();
                }
            }
            else {
                const areaResult = await areaController.get(area);
                next = areaResult?.prefix + '001';
            }

            const dateInit = moment().toDate();
            const state = 'espera';
            const data = {
                turn: next,
                area: area,
                creationDate: dateInit,
                state: state,
                sucursal: sucursal,
            };

            const newTurn = await TurnController.create(data);
            let traceRes: any = {};
            if (newTurn) {
                const trace = {
                    turn: next,
                    startDate: dateInit,
                    ubication: 'recepcion',
                    state: state,
                    sucursal: sucursal,
                    sourceSection: 'recepcion'
                };
                traceRes = await traceTurnController.create(trace);
            }

            return {
                turn: newTurn,
                trace: traceRes
            };
        } catch (error: any) {
            throw error;
        }
    }


    static async getNextTurn(area: string, sucursal: string, dateInit: Date, dateFinish: Date): Promise<any|null> {
        const next = await Turn.aggregate([
            { $lookup: {
                    from: "areas",
                    localField: "area",
                    foreignField: "name",
                    as: "data-area"
                }
            },
            { $match: { 
                sucursal: sucursal, 
                area: area,  
                state: 'espera',
                creationDate:{
                    $gte:dateInit,
                    $lte:dateFinish
                }
            } },
            { $unwind: "$data-area" },
            { $sort: { createdAt: 1 } },
            { $limit: 1 },
            { $project : { 
                "_id": 1,
                "turn": 1,
                "area": 1,
                "state": 1,
                "sucusrsal": 1,
                "creationDate": 1,
                "prefix": "$data-area.prefix"
            }}
        ]);

        return next;
    }

    static async manualTurn(area: string, sucursal: string, ubication: string, useraname: string, dateInit: Date, dateFinish: Date): Promise<ITurn|null> {
        const next = await TurnController.getNextTurn(area, sucursal, dateInit, dateFinish);
        
        if (next.length) {
            const data = {
                turn: next[0].turn,
                ubication: ubication,
                state: 'en atencion',
                username: useraname,
                sucursal: sucursal,
                sourceSection: 'recepcion'
            };

            return await TurnController.createTrace('espera', data);
        }
        else {
            throw new Error("No shifts");
        }
    }

    static async nextTurn(area: string, sucursal: string, ubication: string, useraname: string): Promise<ITurn|null> {
        try {
            const dateInit = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
            const dateFinish = moment().hour(23).minute(59).second(59).millisecond(999).toDate();
            const resModule = await moduleController.get(ubication, sucursal);
            const existeTurnLast = await Trace.find({username: useraname, finalDate: { "$in": [ null, "" ] }});
            
            if (existeTurnLast.length === 0) {
                if (resModule) {
                    if (resModule.mode === 'manual') {
                        const res = await TurnController.manualTurn(area, sucursal, ubication, useraname, dateInit, dateFinish);
                        await moduleController.update(ubication, sucursal, {status: true});
                        return res;
                    }
                    else {
                        if (resModule.isPrivilegeByArrivalTime) {
                            const resPrivilege = await modulePrivilegeController.get(resModule.id);
                            if (resPrivilege) {
                                const auxOrderData = resPrivilege.sort(function (a, b) {
                                    if (a.privilege > b.privilege) {
                                      return 1;
                                    }
                                    if (a.privilege < b.privilege) {
                                      return -1;
                                    }
                                    // a = b
                                    return 0;
                                });
    
                                const lastShifts = [];
                                for (let index = 0; index < auxOrderData.length; index++) {
                                    if (auxOrderData[index].privilege > 0) {
                                        const next = await TurnController.getNextTurn(auxOrderData[index].area, sucursal, dateInit, dateFinish);
                                        if (next.length) {
                                            lastShifts.push(next[0]);
                                        }
                                    }
                                }
    
                                const lastShiftsOrderData = lastShifts.sort(function (a, b) {
                                    
                                    if (moment(a.creationDate) > moment(b.creationDate)) {
                                      return 1;
                                    }
                                    if (moment(a.creationDate) < moment(b.creationDate)) {
                                      return -1;
                                    }
                                    // a = b
                                    return 0;
                                });
    
                                
                                if (lastShiftsOrderData.length) {
                                    const data = {
                                        turn: lastShiftsOrderData[0].turn,
                                        ubication: ubication,
                                        state: 'en atencion',
                                        username: useraname,
                                        sucursal: sucursal,
                                        sourceSection: 'recepcion'
                                    };
                        
                                    const res = await TurnController.createTrace('espera', data);
                                    await moduleController.update(ubication, sucursal, {status: true});
                                    return res;
                                }
                                else {
                                    throw new Error("No shifts");
                                }
                            }
                            // const next = await TurnController.getOldNextTurn(sucursal, dateInit, dateFinish);
                            // if (next.length) {
                            //     const data = {
                            //         turn: next[0].turn,
                            //         ubication: ubication,
                            //         state: 'en atencion',
                            //         username: useraname,
                            //         sucursal: sucursal
                            //     };
                    
                            //     const res = await TurnController.createTrace('espera', data);
                            //     await moduleController.update(ubication, sucursal, {status: true});
                            //     return res;
                            // }
                        }
    
                        const resPrivilege = await modulePrivilegeController.get(resModule.id);
    
                        if (!resPrivilege || (resPrivilege && resPrivilege.length === 0)) {
                            const areas = await areaSucursalController.get(sucursal);
                            console.log("----------------------------------");
                            console.log("Datos areas de una sucursal: ", areas);
                            console.log("----------------------------------");
                            if (areas) {
                                // for (let index = 0; index < areas.length; index++) {
                                //     const next = await TurnController.getNextTurn(areas[index].area, sucursal, dateInit, dateFinish);
                                //     if (next.length) {
                                //         const data = {
                                //             turn: next[0].turn,
                                //             ubication: ubication,
                                //             state: 'en atencion',
                                //             username: useraname,
                                //             sucursal: sucursal
                                //         };
                            
                                //         const res = await TurnController.createTrace('espera', data);
                                //         await moduleController.update(ubication, sucursal, {status: true});
                                //         return res;
                                //     }
                                // }
        
                                throw new Error("No shifts");
                            }
                            else {
                                throw new Error(`Sucursal: ${sucursal} has no areas.`);
                            }
                        }
                        else if (resPrivilege) {
                            const auxOrderData = resPrivilege.sort(function (a, b) {
                                if (a.privilege > b.privilege) {
                                  return 1;
                                }
                                if (a.privilege < b.privilege) {
                                  return -1;
                                }
                                // a = b
                                return 0;
                            });
    
                            const areas = await areaSucursalController.get(sucursal);
                            // let auxAreas: IAreaSucursal[] = [];
    
                            if (areas) {
                                // areas.forEach(a => {
                                //     const result = auxOrderData.find(i => i.area === a.area);
                                //     if (!result) {
                                //         auxAreas.push(a);
                                //     }
                                // });
    
                                for (let index = 0; index < auxOrderData.length; index++) {
                                    if (auxOrderData[index].privilege > 0) {
                                        const next = await TurnController.getNextTurn(auxOrderData[index].area, sucursal, dateInit, dateFinish);
                                        if (next.length) {
                                            const data = {
                                                turn: next[0].turn,
                                                ubication: ubication,
                                                state: 'en atencion',
                                                username: useraname,
                                                sucursal: sucursal,
                                                sourceSection: 'recepcion'
                                            };
                                
                                            const res = await TurnController.createTrace('espera', data);
                                            await moduleController.update(ubication, sucursal, {status: true});
                                            return res;
                                        }
                                    }
                                }
        
        
                                // for (let index = 0; index < auxAreas.length; index++) {
                                //     const next = await TurnController.getNextTurn(auxAreas[index].area, sucursal, dateInit, dateFinish);
                                //     if (next.length) {
                                //         const data = {
                                //             turn: next[0].turn,
                                //             ubication: ubication,
                                //             state: 'en atencion',
                                //             username: useraname,
                                //             sucursal: sucursal
                                //         };
                            
                                //         const res = await TurnController.createTrace('espera', data);
                                //         await moduleController.update(ubication, sucursal, {status: true});
                                //         return res;
                                //     }
                                // }
        
                                throw new Error("No shifts");  
                            }
                            else {
                                throw new Error(`Sucursal: ${sucursal} has no areas.`);
                            }                     
                        }
                        else {
                            throw new Error(`Unhandled exception in privileges.`);
                        }
                    }
                }
                else {
                    throw new Error("Module not found.");
                }
            }
            else {
                throw new Error("Module with turn.");
            }
        } catch (error: any) {
            throw error;
        }
    }

    static async attendedTurn(turn: string, sucursal: string, ubication: string): Promise<ITurn|null> {
        try {
            const auxTurn = await TurnController.get(turn, sucursal);

            const auxState = auxTurn && auxTurn.area.toLowerCase() === 'resultados' ? 'terminado' : 'espera toma';
            const auxubication = auxTurn && auxTurn.area.toLowerCase() === 'resultados' ? 'salida' : 'recepcion';

            const data = {
                turn: turn,
                ubication: auxubication,
                state: auxState,
                sucursal: sucursal,
                sourceSection: 'recepcion'
            };

            const res = await TurnController.createTrace('en atencion', data);
            await moduleController.update(ubication, sucursal, {status: false});
            return res;
        } catch (error: any) {
            throw error;
        }
    }

    static async getTurnsLookOut(sucursal: string) {
        try {
            const dateInit = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
            const dateFinish = moment().hour(23).minute(59).second(59).millisecond(999).toDate();

            return await Turn.find({$and: [{sucursal: sucursal}, {state: {$not: {$eq: 'terminado'}}}, {state: {$not: {$eq: 'cancelado'}}}, {creationDate:{
                $gte:dateInit,
                $lte:dateFinish
            }}]});
        } catch (error: any) {
            throw error;
        }
    }

    static async getTraceLookOut(sucursal: string) {
        try {
            const dateInit = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
            const dateFinish = moment().hour(23).minute(59).second(59).millisecond(999).toDate();

            return await Turn.aggregate([
                { $match: { 
                    $and: [{sucursal: sucursal}, {state: {$not: {$eq: 'terminado'}}}, {state: {$not: {$eq: 'cancelado'}}}, {creationDate:{
                        $gte:dateInit,
                        $lte:dateFinish
                    }}]
                } },
                { $lookup: {
                             from: "TraceTurn",
                             localField: "turn",
                             foreignField: "turn",
                             as: "data-turn"
                           }
                },
                { "$unwind": {
                    "path": "$data-turn",
                    "preserveNullAndEmptyArrays": true
                } },
                { $project : { 
                    "_id": "$data-turn._id",
                    "turn": "$data-turn.turn",
                    "state": "$data-turn.state",
                    "sucursal": "$data-turn.sucursal",
                    "startDate": "$data-turn.startDate",
                    "finalDate": "$data-turn.finalDate",
                    "username": "$data-turn.username",
                    "ubication": "$data-turn.ubication",
                    "sourceSection": "$data-turn.sourceSection",
                }}
            ]);
        } catch (error: any) {
            throw error;
        }
    }

    static async getAssistanceShifts(sucursal: string, area?: string): Promise<any[]|null> {
        try {
            let query: any = { 
                $or: [ {state: 'espera toma'}, {state: 'en toma'}, {$and: [ {state: 're-call'} , {sourceSection: 'toma'} ]} ],
            };
            if (area) {
                query.area = area;
            }

            const dateInit = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
            const dateFinish = moment().hour(23).minute(59).second(59).millisecond(999).toDate();
            
            return await Trace.aggregate([
                { $match: { 
                    sucursal: sucursal, 
                    $or: [ {state: 'espera toma'}, {state: 'en toma'}, {state: 're-call'}],
                    startDate:{
                        $gte:dateInit,
                        $lte:dateFinish
                    },
                    finalDate: { "$in": [ null, "" ] }
                } },
                { $lookup: {
                             from: "shifts",
                             localField: "turn",
                             foreignField: "turn",
                             as: "data-turn"
                           }
                },
                { "$unwind": {
                    "path": "$data-turn",
                    "preserveNullAndEmptyArrays": true
                } },
                { $project : { 
                    "_id": 1,
                    "turn": 1,
                    "state": 1,
                    "sucursal": 1,
                    "startDate": 1,
                    "data-module": 1,
                    "createdAt": 1,
                    "sourceSection": 1,
                    "area": "$data-turn.area"
                }},
                { $lookup: {
                             from: "areas",
                             localField: "area",
                             foreignField: "name",
                             as: "data-area"
                           }
                },
                { $unwind: "$data-area" },
                { $project : { 
                    "_id": 1,
                    "turn": 1,
                    "area": 1,
                    "state": 1,
                    "sucursal": 1,
                    "sourceSection": 1,
                    "creationDate": "$startDate",
                    "prefix": "$data-area.prefix",
                }},
                { $match: query },
                { $sort: { creationDate: 1 } },
            ]);
        } catch (error: any) {
            throw error;
        }
    }

    static async getAssistanceTraces(sucursal: string, area?: string|string[], turn?: string): Promise<any[]|null> {
        try {
            let query: any = { 
                $or: [ {state: 'espera toma'}, {state: 'en toma'}, {$and: [ {state: 're-call'} , {sourceSection: 'toma'} ]} ],
            };

            if (area) {
                if (Array.isArray(area)) {
                    query['$or'] = [];
                    area.forEach(element => {
                        query['$or'].push({area: element});
                    });
                }
                else {
                    query.area = area;
                }
            }

            if (turn) {
                query.turn = turn;
            }

            const dateInit = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
            const dateFinish = moment().hour(23).minute(59).second(59).millisecond(999).toDate();
            
            return await Trace.aggregate([
                { $match: { 
                    sucursal: sucursal, 
                    $or: [ {state: 'espera toma'}, {state: 'en toma'}, {state: 're-call'}],
                    startDate:{
                        $gte:dateInit,
                        $lte:dateFinish
                    },
                    finalDate: { "$in": [ null, "" ] }
                } },
                { $lookup: {
                             from: "shifts",
                             localField: "turn",
                             foreignField: "turn",
                             as: "data-turn"
                           }
                },
                { $lookup: {
                             from: "modules",
                             localField: "ubication",
                             foreignField: "name",
                             as: "data-module"
                           }
                },
                { "$unwind": {
                    "path": "$data-turn",
                    "preserveNullAndEmptyArrays": true
                } },
                { "$unwind": {
                    "path": "$data-module",
                    "preserveNullAndEmptyArrays": true
                } },
                { $project : { 
                    "_id": 1,
                    "turn": 1,
                    "state": 1,
                    "sucursal": 1,
                    "startDate": 1,
                    "data-module": 1,
                    "createdAt": 1,
                    "ubication": 1,
                    "username": 1,
                    "sourceSection": 1,
                    "area": "$data-turn.area"
                }},
                { $lookup: {
                             from: "areas",
                             localField: "area",
                             foreignField: "name",
                             as: "data-area"
                           }
                },
                { $unwind: "$data-area" },
                { $project : { 
                    "_id": 1,
                    "turn": 1,
                    "ubication": 1,
                    "state": 1,
                    "sucursal": 1,
                    "startDate": 1,
                    "area": 1,
                    "sourceSection": 1,
                    "username": 1,
                }},
                { $match: query },
                { $sort: { startDate: 1 } },
            ]);
        } catch (error: any) {
            throw error;
        }
    }

    static async getPenddingShifts(sucursal: string): Promise<any[]|null> {
        try {
            const dateInit = moment().hour(0).minute(0).second(0).millisecond(0).toDate();
            const dateFinish = moment().hour(23).minute(59).second(59).millisecond(999).toDate();
            
            return await Turn.aggregate([
                {
                    $match: {
                        sucursal: sucursal,
                        $or: [ {state: 'en atencion'}, {state: 're-call'}, {state: 'en toma'}],
                        creationDate:{
                            $gte:dateInit,
                            $lte:dateFinish
                        }
                    }
                },
                {
                    $lookup: {
                         from: "TraceTurn",
                         localField: "turn",
                         foreignField: "turn",
                         as: "trace"
                    },
                },
                {
                    $unwind: "$trace",
                },
                {
                    $match: {
                        "trace.finalDate": { "$in": [ null, "" ] }
                    }
                },
                {
                    $project: {
                        _id: '$_id',
                        turn: '$turn',
                        area: '$area',
                        creationDate: '$creationDate',
                        state: '$atate',
                        sucursal: '$sucursal',
                        ubication: '$trace.ubication'
                    }
                },
                { $sort : { creationDate : 1 } },
                { $limit : 3 },
                { $skip : 0 }
             ]);
        } catch (error: any) {
            throw error;
        }
    }

    static async assistanceTurn(turn: string, sucursal: string, ubication: string, username: string): Promise<ITurn|null> {
        try {
            const data = {
                turn: turn,
                ubication: ubication,
                state: 'en toma',
                sucursal: sucursal,
                username: username,
                sourceSection: 'toma'
            };

            const traceTurn = await Trace.find({turn: turn, sucursal: sucursal, sourceSection: 'toma'});

            if (traceTurn.length === 0) {
                return await TurnController.createTrace('espera toma', data);    
            }
            else if (traceTurn.find(t => t.state === 'espera toma')) {
                return await TurnController.createTrace('espera toma', data);    
            }
            else {
                //shift attended by Beto
                throw new Error(`Turno atendido por: ${traceTurn[0].username}`);
            }
        } catch (error: any) {
            throw error;
        }
    }

    static async cancelOrFinishTurn(turn: string, sucursal: string, isFinish: boolean, ubication: string, username: string, source: string): Promise<ITurn|null> {
        try {
            const data = {
                turn: turn,
                state: !isFinish ? 'cancelado' : 'terminado',
                sucursal: sucursal,
                username: username,
                sourceSection: source
            };

            const res = await TurnController.createTrace('', data);
            await moduleController.update(ubication, sucursal, {status: false});
            return res;
        } catch (error: any) {
            throw error;
        }
    }

    static async reCallTurn(turn: string, sucursal: string, ubication: string, source: string, username?: string): Promise<ITurn|null> {
        try {
            const data: any = {
                turn: turn,
                ubication: ubication,
                state: 're-call',
                sucursal: sucursal,
                sourceSection: source
            };

            if (username) {
                data['username'] = username;
            }

            return await TurnController.createTrace('', data);
        } catch (error: any) {
            throw error;
        }
    }

    static async freeTurn(turn: string, sucursal: string): Promise<any|null> {
        try {
            const data = {
                turn: turn,
                ubication: 'recepcion',
                state: 'espera toma',
                sucursal: sucursal,
                sourceSection: 'toma'
            };

            const res = await TurnController.createTrace('', data);
            return res;



            // let trace = await Trace.findOne({turn: turn, sucursal: sucursal, finalDate:{ "$in": [ null, "" ] }});
            // while (trace && trace.state !== 'espera toma') {
            //     await traceTurnController.delete(turn, sucursal, trace.state);
            //     let auxTrace = await Trace.find({turn: turn, sucursal: sucursal}).sort( { "startDate": -1 } ).limit(1);

            //     if (auxTrace.length) {
            //         await Trace.findOneAndUpdate({turn: turn, sucursal: sucursal, state: auxTrace[0].state}, {$unset: {finalDate: 1 }});    
            //         auxTrace[0].finalDate = undefined;
            //     }
                
            //     trace = auxTrace.length === 1 ? auxTrace[0] : null;
            // }
            
            // const state = trace && trace.state ? trace.state.toString() : '';
            // await TurnController.update(turn, sucursal, {state: state});
            // const turnOld = await TurnController.get(turn, sucursal);
            // return {
            //     turn: turnOld,
            //     trace: trace
            // }
            
        } catch (error: any) {
            throw error;
        }
    }

    static async migration(): Promise<boolean> {
        try {
            const res = await Turn.find({});
            const query: any[] = [];
            res.forEach(element => {
                const auxItem: any = {};
                auxItem['insertOne'] = {document: element }
                query.push(auxItem);
            });
            await TurnHistory.bulkWrite(query);

            await Turn.bulkWrite([
                { deleteMany: { filter: {} } }  
            ]);
            
            return true;
        } catch (error) {
            throw error;
        }
    }
}

export default TurnController;