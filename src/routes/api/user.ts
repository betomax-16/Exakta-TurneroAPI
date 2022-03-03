import { Request, Response, Router } from 'express';
import { IUser } from '../../models/user';
import userController from "../../controllers/userController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";
import { IQueryRequest, getQueries } from "../../models/utils/queryRequest";

class UserRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/users')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/users/:username')
                        .get([checkJwt], this.get)
                        .put([checkJwt], this.update)
                        .delete([checkJwt], this.delete);
    }

    async getAll(req: Request, res: Response) {
        try {
            // const { username, rol } = (req as any).jwtPayload;
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result: IUser[]|null = await userController.getAll(auxQueries);
            ResponseWrapper.handler(res, result, 200);    
        } catch (error) {
            Errors.handler(error, res);
        }
    }

    async get(req: Request, res: Response) {
        try {
            const result: IUser|null = await userController.get(req.params.username);
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
            const newUser: IUser|null = await userController.create(req.body);
            ResponseWrapper.handler(res, newUser, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: any|null = await userController.update(req.params.username, req.body);
            
            if (resultUpdate && resultUpdate.modifiedCount == 1) {
                let result: IUser|null;
                if (req.body.username) {
                    result = await userController.get(req.body.username);
                }
                else {
                    result = await userController.get(req.params.username);
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
            const result: IUser|null = await userController.delete(req.params.username);
            if (result) {
                ResponseWrapper.handler(res, {message: 'Successfully deleted user.'}, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 404);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new UserRoutes().router;