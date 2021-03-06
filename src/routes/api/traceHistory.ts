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
    }

    async get(req: Request, res: Response) {
        try {
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result = await traceHistoryController.get(auxQueries);
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
}

export default new TraceHistoryRoutes().router;