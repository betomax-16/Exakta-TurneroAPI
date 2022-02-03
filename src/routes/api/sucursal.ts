import { Request, Response, Router } from 'express';
import { ISucursal } from '../../models/sucursal';
import sucursalController from "../../controllers/sucursalController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";

class AreaRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.getAll = this.getAll.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/sucursal')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/sucursal/:name')
                        .get([checkJwt], this.get)
                        .put([checkJwt], this.update)
                        .delete([checkJwt], this.delete);
    }

    async getAll(req: Request, res: Response) {
        const result: ISucursal[]|null = await sucursalController.getAll();
        ResponseWrapper.handler(res, result, 200);
    }

    async get(req: Request, res: Response) {
        const result: ISucursal|null = await sucursalController.get(req.params.name);
        if (result) {
            ResponseWrapper.handler(res, result, 200);
        }
        else {
            ResponseWrapper.handler(res, {}, 400);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newArea: ISucursal|null = await sucursalController.create(req.body);
            ResponseWrapper.handler(res, newArea, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: any|null = await sucursalController.update(req.params.name, req.body);
            
            if (resultUpdate && resultUpdate.modifiedCount == 1) {
                let result: ISucursal|null;
                if (req.body.name) {
                    result = await sucursalController.get(req.body.name);
                }
                else {
                    result = await sucursalController.get(req.params.name);
                }
                
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
            const result: ISucursal|null = await sucursalController.delete(req.params.name);
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

export default new AreaRoutes().router;