import { Request, Response, Router } from 'express';
import { ITraceHistory } from '../../models/traceHistory';
import traceHistoryController from "../../controllers/traceHistoryController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import moment from "moment";
import { checkJwt } from "../../middlewares/auth";
import { IQueryRequest, getQueries } from "../../models/utils/queryRequest";

class TraceHistoryRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/trace-history')
                        .get([checkJwt], this.get)
                        .delete([checkJwt], this.delete);
        this.router.route('/reports/general')
                        .get([checkJwt], this.generalReport);
        this.router.route('/reports/generalByHour')
                        .get([checkJwt], this.generalReportByHour);
        this.router.route('/reports/detail')
                        .get([checkJwt], this.detailedReport);
    }

    async get(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result = await traceHistoryController.get(jwt, auxQueries);
            ResponseWrapper.handler(res, result, 200);

            // const firstDate = moment(req.query.firstDate?.toString(), ["MM-DD-YYYY", "YYYY-MM-DD"]);
            // const lastDate = moment(req.query.lastDate?.toString(), ["MM-DD-YYYY", "YYYY-MM-DD"]);
            
            // if (firstDate.isValid() && lastDate.isValid() && req.query.sucursal) {
            //     const result = await traceHistoryController.get(req.query.sucursal.toString(), firstDate.format("YYYY-MM-DD"), lastDate.format("YYYY-MM-DD"));
            //     ResponseWrapper.handler(res, result, 200);
            // }
            // else {
            //     ResponseWrapper.handler(res, {message: "Some date has no format [yyyy-mm-dd]."}, 400);
            // }
            
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const date = moment(req.query.date?.toString(), ["MM-DD-YYYY", "YYYY-MM-DD"]);
            if (date.isValid()) {
                const result: ITraceHistory|null = await traceHistoryController.deleteFrom(date.format("YYYY-MM-DD"));
                if (result) {
                    ResponseWrapper.handler(res, {message: 'Successfully deleted.'}, 200);
                }
                else {
                    ResponseWrapper.handler(res, {}, 404);
                } 
            }
            else {
                ResponseWrapper.handler(res, {message: 'Mandatory date.'}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async generalReport(req: Request, res: Response) {
        try {
            const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;

            if (req.query.startDate && 
                formatDate1.test(req.query.startDate.toString()) &&
                moment(req.query.startDate.toString()).isValid() &&
                req.query.finalDate && 
                formatDate1.test(req.query.finalDate.toString()) && 
                moment(req.query.finalDate.toString()).isValid()) {
                
                const startDate = moment(req.query.startDate.toString(), "YYYY-MM-DD").hour(0).minute(0).second(0).millisecond(0);
                const finalDate = moment(req.query.finalDate.toString(), "YYYY-MM-DD").hour(23).minute(59).second(59).millisecond(998);

                const sucursal: string|undefined = req.query.sucursal !== '' ? req.query.sucursal?.toString() : undefined;
                const area: string|undefined = req.query.area !== '' ? req.query.area?.toString() : undefined;
                
                const result = await traceHistoryController.generalReport(startDate.toDate(), finalDate.toDate(), sucursal, area);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async generalReportByHour(req: Request, res: Response) {
        try {
            const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;

            if (req.query.startDate && 
                formatDate1.test(req.query.startDate.toString()) &&
                moment(req.query.startDate.toString()).isValid() &&
                req.query.finalDate && 
                formatDate1.test(req.query.finalDate.toString()) && 
                moment(req.query.finalDate.toString()).isValid()) {
                
                const startDate = moment(req.query.startDate.toString(), "YYYY-MM-DD").hour(0).minute(0).second(0).millisecond(0);
                const finalDate = moment(req.query.finalDate.toString(), "YYYY-MM-DD").hour(23).minute(59).second(59).millisecond(998);

                const sucursal: string|undefined = req.query.sucursal !== '' ? req.query.sucursal?.toString() : undefined;
                const area: string|undefined = req.query.area !== '' ? req.query.area?.toString() : undefined;
                
                const result = await traceHistoryController.generalReportByHour(startDate.toDate(), finalDate.toDate(), sucursal, area);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async detailedReport(req: Request, res: Response) {
        try {
            const formatDate1 = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])$/;

            if (req.query.startDate && 
                formatDate1.test(req.query.startDate.toString()) &&
                moment(req.query.startDate.toString()).isValid() &&
                req.query.finalDate && 
                formatDate1.test(req.query.finalDate.toString()) && 
                moment(req.query.finalDate.toString()).isValid()) {
                
                const startDate = moment(req.query.startDate.toString(), "YYYY-MM-DD").hour(0).minute(0).second(0).millisecond(0);
                const finalDate = moment(req.query.finalDate.toString(), "YYYY-MM-DD").hour(23).minute(59).second(59).millisecond(998);

                const sucursal: string|undefined = req.query.sucursal !== '' ? req.query.sucursal?.toString() : undefined;
                const area: string|undefined = req.query.area !== '' ? req.query.area?.toString() : undefined;
                
                const result = await traceHistoryController.detailedReport(startDate.toDate(), finalDate.toDate(), sucursal, area);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new TraceHistoryRoutes().router;