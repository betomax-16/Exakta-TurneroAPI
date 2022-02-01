import { Request, Response, Router } from 'express';
import { IAreaSucursal } from '../../models/areaSucursal';
import areaSucursalController from "../../controllers/areaSucursalController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";

class AreaSucursalRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/area-sucursal')
                        .get(this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/area-sucursal/:suc/:area')
                        .delete([checkJwt], this.delete)
        this.router.route('/area-sucursal/:suc')
                        .get(this.get);
    }

    async getAll(req: Request, res: Response) {
        const result: IAreaSucursal[]|null = await areaSucursalController.getAll();
        ResponseWrapper.handler(res, result, 200);
    }

    async get(req: Request, res: Response) {
        const result: IAreaSucursal[]|null = await areaSucursalController.get(req.params.suc);
        if (result) {
            ResponseWrapper.handler(res, result, 200);
        }
        else {
            ResponseWrapper.handler(res, {}, 400);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newArea: IAreaSucursal|null = await areaSucursalController.create(req.body);
            ResponseWrapper.handler(res, newArea, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result: IAreaSucursal|null = await areaSucursalController.delete(req.params.suc, req.params.area);
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

export default new AreaSucursalRoutes().router;