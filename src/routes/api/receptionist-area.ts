import { Request, Response, Router } from 'express';
import { IReceptionist_Area } from '../../models/receptionist-area';
import receptionist_areaController from "../../controllers/receptionist-areaController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";

class Receptionist_AreaRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/receptionist-area')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/receptionist-area/:username')
                        .get([checkJwt], this.get);
        this.router.route('/receptionist-area/:username/:area')
                        .delete([checkJwt], this.delete);
    }

    async getAll(req: Request, res: Response) {
        try {
            const result: IReceptionist_Area[]|null = await receptionist_areaController.getAll();
            ResponseWrapper.handler(res, result, 200);
        } catch (error) {
            Errors.handler(error, res);
        }
        
    }

    async get(req: Request, res: Response) {
        try {
            const result: IReceptionist_Area[]|null = await receptionist_areaController.get(req.params.username);
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
            const newRow: IReceptionist_Area|null = await receptionist_areaController.create(req.body);
            ResponseWrapper.handler(res, newRow, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result: IReceptionist_Area|null = await receptionist_areaController.delete(req.params.username, req.params.area);
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

export default new Receptionist_AreaRoutes().router;