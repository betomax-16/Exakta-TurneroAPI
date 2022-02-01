import { Request, Response, Router } from 'express';
import { IConfig } from '../../models/config';
import configController from "../../controllers/configController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";

class ConfigRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.save = this.save.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/config')
                        .get([checkJwt], this.get)
                        .delete([checkJwt], this.delete)
                        .post([checkJwt], this.save);
    }

    async get(req: Request, res: Response) {
        const result: IConfig[]|null = await configController.get();
        ResponseWrapper.handler(res, result, 200);
    }

    async save(req: Request, res: Response) {
        try {
            const newData: IConfig|null = await configController.save(req.body);
            ResponseWrapper.handler(res, newData, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result: IConfig|null = await configController.delete();
            if (result) {
                ResponseWrapper.handler(res, {message: 'Successfully deleted.'}, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 404);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new ConfigRoutes().router;