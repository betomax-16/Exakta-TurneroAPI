import { Request, Response, Router } from 'express';
import { ITurnState } from '../../models/turnState';
import turnStateController from "../../controllers/turnStateController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";

class TurnStateRoutes {
    public router: Router;

    constructor() {
        this.get = this.get.bind(this);
        this.create = this.create.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/turnstate')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create);
        this.router.route('/turnstate/:name')
                        .get([checkJwt], this.get);
    }

    async getAll(req: Request, res: Response) {
        const result: ITurnState[]|null = await turnStateController.getAll();
        ResponseWrapper.handler(res, result, 200);
    }

    async get(req: Request, res: Response) {
        const result: ITurnState|null = await turnStateController.get(req.params.name);
        if (result) {
            ResponseWrapper.handler(res, result, 200);
        }
        else {
            ResponseWrapper.handler(res, {}, 404);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newTurnState: ITurnState|null = await turnStateController.create(req.body);
            ResponseWrapper.handler(res, newTurnState, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }
}

export default new TurnStateRoutes().router;