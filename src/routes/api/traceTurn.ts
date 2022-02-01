import { Request, Response, Router } from 'express';
import { ITraceTurn } from '../../models/traceTurn';
import traceTurnController from "../../controllers/traceTurnController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
// import moment from "moment";
import { checkJwt } from "../../middlewares/auth";
import { IQueryRequest, getQueries } from "../../models/utils/queryRequest";

class TraceRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/trace')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/trace/:turn/:suc/:status')
                        .get([checkJwt], this.get)
                        .put([checkJwt], this.update);
    }

    async getAll(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result: ITraceTurn[]|null = await traceTurnController.getAll(jwt, auxQueries);
            ResponseWrapper.handler(res, result, 200);
        } catch (error) {
            Errors.handler(error, res);
        }
    }

    async get(req: Request, res: Response) {
        try {
            const result = await traceTurnController.getOne(req.params.turn, req.params.suc, req.params.status);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newArea: ITraceTurn|null = await traceTurnController.create(req.body);
            ResponseWrapper.handler(res, newArea, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: ITraceTurn|null = await traceTurnController.update(req.params.turn, req.params.suc, req.params.status, req.body);
            ResponseWrapper.handler(res, resultUpdate, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new TraceRoutes().router;