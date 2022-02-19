import TraceHistory, { ITraceHistory } from '../models/traceHistory';
import moment from "moment";
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";
import { diacriticSensitiveRegex } from "../models/utils/queryRequest";

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

    static async generalReport(startDate: Date, finalDate: Date, sucursal?: string, area?: string) :Promise<any[]> {
        try {
            const query: any[] = [ { startDate: { '$gte': startDate } }, { finalDate: { '$lte': finalDate } } ];

            if (sucursal) {
                let str = diacriticSensitiveRegex(sucursal);
                query.push({ sucursal: { $regex: `^${str}$`, $options: "i" } });
            }

            let query2= {};
            if (area) {
                let str = diacriticSensitiveRegex(area);
                query2 = { area: { $regex: `^${str}$`, $options: "i" } };
            }

            const res = await TraceHistory.aggregate([
                {
                    $match: { '$and': query }
                },
                {
                    $lookup: {
                         from: "TurnHistory",
                         localField: "turn",
                         foreignField: "turn",
                         as: "dataTurn"
                    }
                },
                { $unwind : "$dataTurn" },
                {   $project: { 
                        _id: 1,
                        turn: 1,
                        startDate: 1,
                        finalDate: 1,
                        state: 1,
                        sucursal: 1,
                        ubication: 1,
                        area: "$dataTurn.area"
                    } 
                },
                {
                    $match: query2
                }
            ]);

            //Creacion de matriz de milisegundos
            const sucursals: string[] = [];
            const areas: string[] = [];
            const table: any[] = [];
            res.forEach(element => {
                const start = moment(element.startDate);
                const final = moment(element.finalDate);

                table.push({
                    sucursal: element.sucursal,
                    area: element.area,
                    turn: element.turn,
                    state: element.state,
                    timeMili: final.diff(start)
                });

                if (!sucursals.includes(element.sucursal)) {
                    sucursals.push(element.sucursal);
                }

                if (!areas.includes(element.area)) {
                    areas.push(element.area);
                }
            });

            const resum: any[] = [];
            sucursals.forEach(suc => {
                const dataSucursal = table.filter(r => r.sucursal === suc);
                areas.forEach(area => {
                    const dataArea = dataSucursal.filter(r => r.area === area);

                    const turns: string[] = [];
                    let waitTime: number = 0;
                    let serviceTime: number = 0;
                    let attentionTime: number = 0;
                    let canceledShifts: number = 0;
                    let shiftsFinished: number = 0;
                    let maxWaitTime: number = 0;
                    let maxWaitAttentionTime: number = 0;

                    dataArea.forEach(element => {
                        if (element.state === 'espera') {
                            turns.push(element.turn);
                        }

                        if (element.state === 'cancelado') {
                            canceledShifts++;
                        }

                        if (element.state === 'terminado') {
                            shiftsFinished++;
                        }

                        if (element.state === 're-call') {
                            const resFinish = dataArea.find(r => r.turn === element.turn && r.state === 'terminado' && moment(r.startDate).day() ===  moment(element.startDate).day());
                            if (resFinish) {
                                attentionTime += element.timeMili;
                                maxWaitAttentionTime += element.timeMili;
                            }
                            else {
                                const resCancel = dataArea.find(r => r.turn === element.turn && r.state === 'cancelado' && moment(r.startDate).day() ===  moment(element.startDate).day());
                                if (resCancel) {
                                    waitTime += element.timeMili;
                                    maxWaitTime += element.timeMili;
                                }
                            }
                        }

                        if (element.state === 'espera' || element.state === 'espera toma') {
                            waitTime += element.timeMili;
                            if (maxWaitTime < element.timeMili) {
                                maxWaitTime = element.timeMili;
                            }
                        }

                        if (element.state === 'en atencion' || element.state === 'en toma') {
                            attentionTime += element.timeMili;
                            if (maxWaitAttentionTime < element.timeMili) {
                                maxWaitAttentionTime = element.timeMili;
                            }
                        }

                        serviceTime += element.timeMili;
                    });

                    const averageWaitTime = turns.length === 0 ? 0 : waitTime / turns.length;
                    const averageAttentionTime = turns.length === 0 ? 0 : attentionTime / turns.length;
                    const averageServiceTime = turns.length === 0 ? 0 : serviceTime / turns.length;

                    resum.push({
                        sucursal: suc,
                        area: area,
                        shiftsCreated: turns.length,
                        canceledShifts: canceledShifts,
                        shiftsFinished: shiftsFinished,
                        averageWaitTime: TraceHistoryController.msToTime(averageWaitTime),
                        averageAttentionTime: TraceHistoryController.msToTime(averageAttentionTime),
                        averageServiceTime: TraceHistoryController.msToTime(averageServiceTime),
                        maxWaitTime: TraceHistoryController.msToTime(maxWaitTime),
                        maxWaitAttentionTime: TraceHistoryController.msToTime(maxWaitAttentionTime)
                    });
                });
            });

            return resum;
        } catch (error: any) {
            throw error;
        }
    }

    static async generalReportByHour(startDate: Date, finalDate: Date, sucursal?: string, area?: string) :Promise<any[]> {
        try {
            const query: any[] = [ { startDate: { '$gte': startDate } }, { finalDate: { '$lte': finalDate } } ];

            if (sucursal) {
                let str = diacriticSensitiveRegex(sucursal);
                query.push({ sucursal: { $regex: `^${str}$`, $options: "i" } });
            }

            let query2= {};
            if (area) {
                let str = diacriticSensitiveRegex(area);
                query2 = { area: { $regex: `^${str}$`, $options: "i" } };
            }

            const res = await TraceHistory.aggregate([
                {
                    $match: { '$and': query }
                },
                {
                    $lookup: {
                         from: "TurnHistory",
                         localField: "turn",
                         foreignField: "turn",
                         as: "dataTurn"
                    }
                },
                { $unwind : "$dataTurn" },
                {   $project: { 
                        _id: 1,
                        turn: 1,
                        startDate: 1,
                        finalDate: 1,
                        state: 1,
                        sucursal: 1,
                        ubication: 1,
                        area: "$dataTurn.area"
                    } 
                },
                {
                    $match: query2
                }
            ]);

            //Creacion de matriz de milisegundos
            const sucursals: string[] = [];
            const areas: string[] = [];
            const table: any[] = [];
            res.forEach(element => {
                const start = moment(element.startDate);
                const final = moment(element.finalDate);

                table.push({
                    sucursal: element.sucursal,
                    area: element.area,
                    turn: element.turn,
                    state: element.state,
                    timeMili: final.diff(start),
                    startDate: element.startDate
                });

                if (!sucursals.includes(element.sucursal)) {
                    sucursals.push(element.sucursal);
                }

                if (!areas.includes(element.area)) {
                    areas.push(element.area);
                }
            });

            const resum: any[] = [];
            sucursals.forEach(suc => {
                const dataSucursal = table.filter(r => r.sucursal === suc);
                areas.forEach(area => {
                    const dataArea = dataSucursal.filter(r => r.area === area);

                    const interval = 30;
                    const objectTracesTurnByInterval: any = {};
                    let dateInit = moment().hour(0).minute(0);
                    let dateFinish = moment().hour(0).minute(0);
                    for (let index = 0; index < 48; index++) {
                        const hour: string = dateInit.hour() < 10 ? `0${dateInit.hour()}` : dateInit.hour().toString();
                        const minute: string = dateInit.minute() < 10 ? `0${dateInit.minute()}` : dateInit.minute().toString();
                        const indexTime = `${hour}:${minute}`;
                        
                        dateFinish = dateFinish.add(interval, 'minute');
                        let result: any[] = [];
                        if (dateInit.hour() === dateFinish.hour()) {
                            result = dataArea.filter(r => 
                                moment(r.startDate).hour() === dateInit.hour() && 
                                moment(r.startDate).minute() >= dateInit.minute() && 
                                moment(r.startDate).minute() < dateFinish.minute());
                        }
                        else {
                            result = dataArea.filter(r => 
                                moment(r.startDate).hour() === dateInit.hour() && 
                                moment(r.startDate).minute() >= dateInit.minute());
                        }
                        
                        if (result && result.length) {
                            objectTracesTurnByInterval[indexTime] = result;
                        }
                        dateInit = dateInit.add(interval, 'minute');
                    }
                    
                    for (const key in objectTracesTurnByInterval) {

                        const waitShifts: string[] = [];
                        const attentionShifts: string[] = [];
                        let waitTime: number = 0;
                        let serviceTime: number = 0;
                        let attentionTime: number = 0;
                        let canceledShifts: number = 0;
                        let shiftsFinished: number = 0;
                        let maxWaitTime: number = 0;
                        let maxWaitAttentionTime: number = 0;

                        if (Object.prototype.hasOwnProperty.call(objectTracesTurnByInterval, key)) {
                            const traces: any[] = objectTracesTurnByInterval[key];
                            
                            traces.forEach(element => {
                                if (element.state === 'espera') {
                                    waitShifts.push(element.turn);
                                }

                                if (element.state === 'cancelado') {
                                    canceledShifts++;
                                }

                                if (element.state === 'terminado') {
                                    shiftsFinished++;
                                }

                                if (element.state === 're-call') {
                                    const resFinish = traces.find(r => r.turn === element.turn && r.state === 'terminado' && moment(r.startDate).day() ===  moment(element.startDate).day());
                                    if (resFinish) {
                                        attentionTime += element.timeMili;
                                        maxWaitAttentionTime += element.timeMili;
                                    }
                                    else {
                                        const resCancel = traces.find(r => r.turn === element.turn && r.state === 'cancelado' && moment(r.startDate).day() ===  moment(element.startDate).day());
                                        if (resCancel) {
                                            waitTime += element.timeMili;
                                            maxWaitTime += element.timeMili;
                                        }
                                    }
                                }

                                if (element.state === 'espera' || element.state === 'espera toma') {
                                    waitTime += element.timeMili;
                                    if (maxWaitTime < element.timeMili) {
                                        maxWaitTime = element.timeMili;
                                    }
                                }

                                if (element.state === 'en atencion' || element.state === 'en toma') {
                                    attentionShifts.push(element.turn);
                                    attentionTime += element.timeMili;
                                    if (maxWaitAttentionTime < element.timeMili) {
                                        maxWaitAttentionTime = element.timeMili;
                                    }
                                }

                                serviceTime += element.timeMili;
                            });

                            const averageWaitTime = waitShifts.length === 0 ? 0 : waitTime / waitShifts.length;
                            const averageAttentionTime = attentionShifts.length === 0 ? 0 : attentionTime / attentionShifts.length;
                            const averageServiceTime = waitShifts.length === 0 ? 0 : serviceTime / waitShifts.length;

                            resum.push({
                                time: key,
                                sucursal: suc,
                                area: area,
                                shiftsCreated: waitShifts.length,
                                canceledShifts: canceledShifts,
                                shiftsFinished: shiftsFinished,
                                averageWaitTime: TraceHistoryController.msToTime(averageWaitTime),
                                averageAttentionTime: TraceHistoryController.msToTime(averageAttentionTime),
                                averageServiceTime: TraceHistoryController.msToTime(averageServiceTime),
                                maxWaitTime: TraceHistoryController.msToTime(maxWaitTime),
                                maxWaitAttentionTime: TraceHistoryController.msToTime(maxWaitAttentionTime)
                            });
                        }
                    }
                });
            });

            return resum;
        } catch (error: any) {
            throw error;
        }
    }

    static async detailedReport(startDate: Date, finalDate: Date, sucursal?: string, area?: string) :Promise<any[]> {
        try {
            const query: any[] = [ { startDate: { '$gte': startDate } }, { finalDate: { '$lte': finalDate } } ];

            if (sucursal) {
                let str = diacriticSensitiveRegex(sucursal);
                query.push({ sucursal: { $regex: `^${str}$`, $options: "i" } });
            }

            let query2= {};
            if (area) {
                let str = diacriticSensitiveRegex(area);
                query2 = { area: { $regex: `^${str}$`, $options: "i" } };
            }

            const res = await TraceHistory.aggregate([
                {
                    $match: { '$and': query }
                },
                {
                    $lookup: {
                         from: "TurnHistory",
                         localField: "turn",
                         foreignField: "turn",
                         as: "dataTurn"
                    }
                },
                { $unwind : "$dataTurn" },
                {   $project: { 
                        _id: 1,
                        turn: 1,
                        startDate: 1,
                        finalDate: 1,
                        state: 1,
                        sucursal: 1,
                        ubication: 1,
                        username: 1,
                        area: "$dataTurn.area"
                    } 
                },
                {
                    $match: query2
                }
            ]);

            //Creacion de matriz de milisegundos
            const sucursals: string[] = [];
            const table: any[] = [];
            res.forEach(element => {
                const start = moment(element.startDate);
                const final = moment(element.finalDate);

                table.push({
                    sucursal: element.sucursal,
                    area: element.area,
                    turn: element.turn,
                    state: element.state,
                    ubication: element.ubication,
                    username: element.username,
                    timeMili: final.diff(start),
                    startDate: element.startDate,
                    finalDate: element.finalDate
                });

                if (!sucursals.includes(element.sucursal)) {
                    sucursals.push(element.sucursal);
                }
            });

            let resum: any[] = [];
            sucursals.forEach(suc => {
                const dataSucursal = table.filter(r => r.sucursal === suc);
                const shifts = dataSucursal.filter(r => r.state === 'espera');

                shifts.forEach(turn => {
                    const traces = dataSucursal.filter(r => 
                        r.turn === turn.turn && 
                        moment(turn.startDate).format('YYYY-MM-DD') === moment(r.startDate).format('YYYY-MM-DD'));
                    
                        let waitTime: number = 0;
                        let attentionTime: number = 0;
                        let hourFinish: string = '';
                        let hourCall: string = '';
                        let hourInit: string = '';
                        let dateInit: string =  moment(turn.startDate).format('YYYY-MM-DD');
                        let user: string = '';
                        let module: string = '';

                        const tracesReception = traces.filter(r => r.username !== undefined || r.state === 'espera');
                        const tracesToma = traces.filter(r => r.username === undefined || r.username === null);

                        tracesReception.forEach(element => {
                            if (element.state === 'en atencion') {
                                hourCall = moment(element.startDate).format('hh:mm:ss');
                                user = element.username;
                                module = element.ubication;
                                hourFinish = moment(element.finalDate).format('hh:mm:ss');
                            }

                            if (element.state === 're-call') {
                                const resFinish = traces.find(r => r.turn === element.turn && (r.state === 'terminado' || r.state === 'espera toma') && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                if (resFinish) {
                                    attentionTime += element.timeMili;
                                }
                                else {
                                    const resCancel = traces.find(r => r.turn === element.turn && r.state === 'cancelado' && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                    if (resCancel) {
                                        waitTime += element.timeMili;
                                    }
                                }
                            }

                            if (element.state === 'espera') {
                                hourInit = moment(element.startDate).format('hh:mm:ss');
                                waitTime += element.timeMili;
                            }

                            if (element.state === 'en atencion') {
                                attentionTime += element.timeMili;
                            }
                        });

                        resum.push({
                            sucursal: turn.sucursal,
                            turn: turn.turn,
                            area: turn.area,
                            date: dateInit,
                            module: module,
                            user: user,
                            beginningTime: hourInit,
                            callingTime: hourCall,
                            endingTime: hourFinish,
                            waitTime: TraceHistoryController.msToTime(waitTime),
                            attentionTime: TraceHistoryController.msToTime(attentionTime),
                            startDate: turn.startDate
                        });

                        if (turn.area !== 'Resultados') {
                            waitTime = 0;
                            attentionTime = 0;
                            hourFinish = '';
                            hourCall = '';
                            hourInit = '';
                            user = '';
                            module = '';
                            tracesToma.forEach(element => {
                                if (element.state === 'en toma') {
                                    hourCall = moment(element.startDate).format('hh:mm:ss');
                                    user = element.username;
                                    module = element.ubication;
                                    hourFinish = moment(element.finalDate).format('hh:mm:ss');
                                }

                                if (element.state === 're-call') {
                                    const resFinish = traces.find(r => r.turn === element.turn && r.state === 'terminado' && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                    if (resFinish) {
                                        attentionTime += element.timeMili;
                                    }
                                    else {
                                        const resCancel = traces.find(r => r.turn === element.turn && r.state === 'cancelado' && moment(r.startDate).format('YYYY-MM-DD') === moment(element.startDate).format('YYYY-MM-DD'));
                                        if (resCancel) {
                                            waitTime += element.timeMili;
                                        }
                                    }
                                }

                                if (element.state === 'espera toma') {
                                    hourInit = moment(element.startDate).format('hh:mm:ss');
                                    waitTime += element.timeMili;
                                }

                                if (element.state === 'en toma') {
                                    attentionTime += element.timeMili;
                                }
                            });

                            resum.push({
                                sucursal: turn.sucursal,
                                turn: turn.turn,
                                area: `Toma ${turn.area}`,
                                date: dateInit,
                                module: module,
                                user: user,
                                beginningTime: hourInit,
                                callingTime: hourCall,
                                endingTime: hourFinish,
                                waitTime: TraceHistoryController.msToTime(waitTime),
                                attentionTime: TraceHistoryController.msToTime(attentionTime),
                                startDate: turn.startDate
                            });                            
                        }
                });
                
            });


            const auxResum = resum.sort(( a, b ) => {
                if ( moment(a.startDate) < moment(b.startDate) ){
                  return -1;
                }
                if ( moment(a.startDate) > moment(b.startDate) ){
                  return 1;
                }
                return 0;
            });

            resum = auxResum;

            return resum;
        } catch (error: any) {
            throw error;
        }
    }

    static msToTime(duration: number) {
        const milliseconds = parseInt(((duration % 1000) / 100).toString());
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        const h = (hours < 10) ? "0" + hours : hours;
        const m = (minutes < 10) ? "0" + minutes : minutes;
        const s = (seconds < 10) ? "0" + seconds : seconds;
      
        return h + ":" + m + ":" + s + "." + milliseconds;
    }
}

export default TraceHistoryController;