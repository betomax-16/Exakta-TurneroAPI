import { Request, Response, Router } from 'express';
import { IModulePrivilege } from '../../models/modulePrivilege';
import modulePrivilegeController from "../../controllers/modulePrivilegeController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";

class ModulePrivilegeRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/privilege')
                        .post([checkJwt], this.create);
        this.router.route('/privilege/:idmodule')
                        .get([checkJwt], this.get);
        this.router.route('/privilege/:id')
                        .put([checkJwt], this.update)
                        .delete([checkJwt], this.delete);
    }

    async get(req: Request, res: Response) {
        try {
            const result: IModulePrivilege[]|null = await modulePrivilegeController.get(req.params.idmodule);
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
            const newRow: IModulePrivilege|null = await modulePrivilegeController.create(req.body);
            ResponseWrapper.handler(res, newRow, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: any|null = await modulePrivilegeController.update(req.params.id, req.body);

            if (resultUpdate && resultUpdate.modifiedCount == 1) {
                const result: IModulePrivilege|null = await modulePrivilegeController.getById(req.params.id);
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
            const result: IModulePrivilege|null = await modulePrivilegeController.delete(req.params.id);
            if (result) {
                ResponseWrapper.handler(res, {message: 'Eliminación exitosa.'}, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 404);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new ModulePrivilegeRoutes().router;