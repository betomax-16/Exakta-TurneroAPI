import { Request, Response, Router } from 'express';
import { IModule } from '../../models/module';
import moduleController from "../../controllers/moduleController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { IQueryRequest, getQueries } from "../../models/utils/queryRequest";

class ModuleRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/modules')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/modules/:name/:suc')
                        .get(this.get)
                        .put([checkJwt], this.update)
                        .delete([checkJwt], this.delete);
    }

    async getAll(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result: IModule[]|null = await moduleController.getAll(jwt, auxQueries);
            ResponseWrapper.handler(res, result, 200);
        } catch (error) {
            Errors.handler(error, res);
        }
    }

    async get(req: Request, res: Response) {
        try {
            const result: IModule|null = await moduleController.get(req.params.name, req.params.suc);
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

    async create(req: Request, res: Response) {
        try {
            const newUser: IModule|null = await moduleController.create(req.body);
            ResponseWrapper.handler(res, newUser, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: any|null = await moduleController.update(req.params.name, req.params.suc, req.body);
            
            if (resultUpdate && resultUpdate.modifiedCount == 1) {
                const result: IModule|null = await moduleController.get(req.params.name, req.params.suc);
                ResponseWrapper.handler(res, result, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 404);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result: IModule|null = await moduleController.delete(req.params.name, req.params.suc);
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

export default new ModuleRoutes().router;