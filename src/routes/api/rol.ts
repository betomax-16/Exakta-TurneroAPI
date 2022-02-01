import { Request, Response, Router } from 'express';
import { IRol } from '../../models/rol';
import rolController from "../../controllers/rolController";
import User from "../../models/user";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";

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
        this.router.route('/roles')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/roles/:name')
                        .get([checkJwt], this.get)
                        .delete([checkJwt], this.delete);
    }

    async getAll(req: Request, res: Response) {
        const result: IRol[]|null = await rolController.getAll();
        ResponseWrapper.handler(res, result, 200);
    }

    async get(req: Request, res: Response) {
        const result: IRol|null = await rolController.get(req.params.name);
        if (result) {
            ResponseWrapper.handler(res, result, 200);
        }
        else {
            ResponseWrapper.handler(res, {}, 404);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newUser: IRol|null = await rolController.create(req.body.name);
            ResponseWrapper.handler(res, newUser, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            if (await User.find({rol: req.params.name}).count() == 0) {
                const result: IRol|null = await rolController.delete(req.params.name);
                if (result) {
                    ResponseWrapper.handler(res, {message: 'Successfully deleted.'}, 200);
                }
                else {
                    ResponseWrapper.handler(res, {}, 404);
                }
            }
            else {
                ResponseWrapper.handler(res, {message: 'There are active users with that role, update their roles and continue with the deletion.'}, 428);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new ModuleRoutes().router;