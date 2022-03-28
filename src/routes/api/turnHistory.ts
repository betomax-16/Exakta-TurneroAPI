import { Request, Response, Router } from 'express';
import { ITurnHistory } from '../../models/turnHistory';
import turnHistoryController from "../../controllers/turnHistoryController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";
import moment from "moment";
import { IQueryRequest, getQueries } from "../../models/utils/queryRequest";

class TurnHistoryRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.deleteDaysAgo = this.deleteDaysAgo.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/turnhistory')
                        .get([checkJwt], this.getAll)
                        .delete([checkJwt], this.deleteDaysAgo);
        this.router.route('/turnhistory/:id')
                        .get([checkJwt], this.get);
    }

    //paginar o agregar filtros
    async getAll(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result: ITurnHistory[]|null = await turnHistoryController.getAll(jwt, auxQueries);
            ResponseWrapper.handler(res, result, 200);
    
            // const firstDate = moment(req.query.firstDate?.toString(), ["MM-DD-YYYY", "YYYY-MM-DD"]);
            // const lastDate = moment(req.query.lastDate?.toString(), ["MM-DD-YYYY", "YYYY-MM-DD"]);
    
            // if (firstDate.isValid() && lastDate.isValid() && req.query.sucursal) {
            //     const result: ITurnHistory[]|null = await turnHistoryController.getAll(req.query.sucursal.toString(), firstDate.format("YYYY-MM-DD"), lastDate.format("YYYY-MM-DD"));
            //     ResponseWrapper.handler(res, result, 200);
            // }
            // else {
            //     ResponseWrapper.handler(res, {message: "Some date has no format [yyyy-mm-dd] or sucursal is empty."}, 400);
            // }    
        } catch (error) {
            Errors.handler(error, res);
        }
    }

    async get(req: Request, res: Response) {
        try {
            const result: ITurnHistory|null = await turnHistoryController.get(req.params.id);
            if (result) {
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 404);
            }
        } catch (error) {
            Errors.handler(error, res);
        }
    }

    async deleteDaysAgo(req: Request, res: Response) {
        try {
            const date = moment(req.query.date?.toString(), ["MM-DD-YYYY", "YYYY-MM-DD"]);
            if (date.isValid()) {
                const result: ITurnHistory|null = await turnHistoryController.deleteFrom(date.format("YYYY-MM-DD"));
                if (result) {
                    ResponseWrapper.handler(res, {message: 'Eliminación exitosa.'}, 200);
                }
                else {
                    ResponseWrapper.handler(res, {}, 404);
                } 
            }
            else {
                ResponseWrapper.handler(res, {message: 'Fecha obligatoria.'}, 400);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new TurnHistoryRoutes().router;