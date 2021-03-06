import { Request, Response, Router } from 'express';
import { IArea } from '../../models/area';
import areaController from "../../controllers/areaController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";

class AreaRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/areas')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/areas/:name')
                        .get([checkJwt], this.get)
                        .put([checkJwt], this.update)
                        .delete([checkJwt], this.delete);
    }

    async getAll(req: Request, res: Response) {
        const result: IArea[]|null = await areaController.getAll();
        ResponseWrapper.handler(res, result, 200);
    }

    async get(req: Request, res: Response) {
        const result: IArea|null = await areaController.get(req.params.name);
        if (result) {
            ResponseWrapper.handler(res, result, 200);
        }
        else {
            ResponseWrapper.handler(res, {}, 400);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newArea: IArea|null = await areaController.create(req.body);
            ResponseWrapper.handler(res, newArea, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: any|null = await areaController.update(req.params.name, req.body);
            
            if (resultUpdate && resultUpdate.modifiedCount == 1) {
                let result: IArea|null;
                if (req.body.name) {
                    result = await areaController.get(req.body.name);
                }
                else {
                    result = await areaController.get(req.params.name);
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
            //Verificar que no existan Turnos que referencien al area
            //Si hay recepcionistas asociadas al area a eliminar, eliminar esos registros
            const result: IArea|null = await areaController.delete(req.params.name);
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