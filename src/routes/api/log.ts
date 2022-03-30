import { Request, Response, Router } from 'express';
import { ILogError } from '../../models/logErrors';
import logErrorController from "../../controllers/logErrorController";
import { ILogAction } from "../../models/logAction";
import logActionController from "../../controllers/logActionController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";

class LogRoutes {
    public router: Router;

    constructor() {
        this.createError = this.createError.bind(this);
        this.createAction = this.createAction.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/log/error')
                        .post([checkJwt], this.createError);
        this.router.route('/log/action')
                        .post([checkJwt], this.createAction);
    }

    async createError(req: Request, res: Response) {
        try {
            const newLog: ILogError|null = await logErrorController.create(req.body);
            ResponseWrapper.handler(res, newLog, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async createAction(req: Request, res: Response) {
        try {
            const newLog: ILogAction|null = await logActionController.create(req.body);
            ResponseWrapper.handler(res, newLog, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new LogRoutes().router;