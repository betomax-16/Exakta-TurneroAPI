import { Request, Response, Router } from 'express';
import { ISupervisor } from '../../models/supervisors';
import supervisorController from "../../controllers/supervisorController";
import { Errors } from "../../utils/errors";
import { checkJwt } from "../../middlewares/auth";
import { ResponseWrapper } from "../../utils/responseWrapper";

class SupervisorRoutes {
    public router: Router;

    constructor() {
        this.getSalves = this.getSalves.bind(this);
        this.getSupervisors = this.getSupervisors.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/slaves/:idVigia')
                        .get([checkJwt], this.getSalves);
        this.router.route('/supervisors/:idModule')
                        .get([checkJwt], this.getSupervisors);
        this.router.route('/supervisors/:id')
                        .delete([checkJwt], this.delete);
        this.router.route('/supervisors')
                        .post([checkJwt], this.create);
    }

    async getSalves(req: Request, res: Response) {
        const result: ISupervisor[] = await supervisorController.getSlaves(req.params.idVigia);
        ResponseWrapper.handler(res, result, 200);
    }

    async getSupervisors(req: Request, res: Response) {
        const result: ISupervisor[] = await supervisorController.getSupervisors(req.params.idModule);
        ResponseWrapper.handler(res, result, 200);
    }

    async create(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const { rol } = jwt;
            if (rol === 'Admin') {
                const newData: ISupervisor|null = await supervisorController.create(req.body);
                if (newData) {
                    const response: ISupervisor[] = await supervisorController.getById(newData._id);
                    ResponseWrapper.handler(res, response, 201);
                }
                else {
                    ResponseWrapper.handler(res, {message: 'cannot create binding'}, 500);
                }
            }
            else {
                ResponseWrapper.handler(res, {message: 'unauthorized'}, 401);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const { rol } = jwt;
            if (rol === 'Admin') {
                const result: ISupervisor|null = await supervisorController.delete(req.params.id);
                if (result) {
                    ResponseWrapper.handler(res, {message: 'Successfully deleted.'}, 200);
                }
                else {
                    ResponseWrapper.handler(res, {}, 404);
                }
            }
            else {
                ResponseWrapper.handler(res, {message: 'unauthorized'}, 401);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new SupervisorRoutes().router;