import { Request, Response, Router } from 'express';
import { ITurn } from '../../models/turn';
import turnController from "../../controllers/turnController";
import traceTurnController from "../../controllers/traceTurnController";
import moduleController from "../../controllers/moduleController";
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";
import { checkJwt } from "../../middlewares/auth";
import { checkOptionalJwt } from "../../middlewares/optionalAuth";
import { IQueryRequest, getQueries } from "../../models/utils/queryRequest";

class TurnRoutes {
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
        this.router.route('/shifts')
                        .get([checkJwt], this.getAll)
                        .post([checkJwt], this.create)
                        .delete([checkJwt], this.delete);
        this.router.route('/shifts/:turn/:suc')
                        .get([checkJwt], this.get)
                        .put([checkJwt], this.update)
        
        this.router.route('/action/take')
                        .post(this.takeNewTurn);
        this.router.route('/action/next')
                        .post([checkJwt], this.nextTurn);
        this.router.route('/action/attended')
                        .post([checkJwt], this.attendedTurn);
        this.router.route('/action/pendding/:suc')
                        .get(this.getPenddingShifts);
        this.router.route('/action/attended/:suc')
                        .get(this.getAssistanceShifts);
        this.router.route('/action/attended-traces/:suc')
                        .get(this.getAssistanceTraces);
        this.router.route('/action/assistance')
                        .post(this.assistanceTurn);
        this.router.route('/action/cancelation')
                        .post(this.cancelTurn);
        this.router.route('/action/recall')
                        .post([checkOptionalJwt], this.reCallTurn);
        this.router.route('/action/finished')
                        .post(this.finishTurn);
        this.router.route('/action/free')
                        .post(this.freeTurn);

        this.router.route('/action/reset')
                        .delete(this.resset);
    }

    async getAll(req: Request, res: Response) {
        try {
            const jwt = (req as any).jwtPayload;
            const auxQueries: IQueryRequest[] = getQueries(req);
            const result: ITurn[]|null = await turnController.getAll(jwt, auxQueries);
            ResponseWrapper.handler(res, result, 200);
        } catch (error) {
            Errors.handler(error, res);
        }
    }

    async get(req: Request, res: Response) {
        const result: ITurn|null = await turnController.get(req.params.turn, req.params.suc);
        if (result) {
            ResponseWrapper.handler(res, result, 200);
        }
        else {
            ResponseWrapper.handler(res, {}, 404);
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newArea: ITurn|null = await turnController.create(req.body);
            ResponseWrapper.handler(res, newArea, 200);            
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const resultUpdate: any|null = await turnController.update(req.params.turn, req.params.suc, req.body);
            
            if (resultUpdate && resultUpdate.modifiedCount == 1) {
                const result: ITurn|null = await turnController.get(req.params.turn, req.params.suc);
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
            const result: ITurn|null = await turnController.delete();
            if (result) {
                ResponseWrapper.handler(res, {message: 'Successfully deleted.'}, 200);
            }
            else {
                ResponseWrapper.handler(res, {}, 404);
                res.status(404).json({});
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }




    async takeNewTurn(req: Request, res: Response) {
        try {
            const { area, sucursal } = req.body;
            const result = await turnController.takeNewTurn(area, sucursal);
            ResponseWrapper.handler(res, result, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async nextTurn(req: Request, res: Response) {
        try {
            const { area, sucursal } = req.body;
            const auxReq: any = req;
            const username = auxReq.jwtPayload.username;
            const resultModule = await moduleController.getByUser(username);
            if (resultModule) {
                const result = await turnController.nextTurn(area, sucursal, resultModule.name, username);
                ResponseWrapper.handler(res, result, 201);
            }
            else {
                throw new Error(`The user ${username} is not in a module`);
            }
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async attendedTurn(req: Request, res: Response) {
        try {
            const { turn, sucursal, module } = req.body;
            const result = await turnController.attendedTurn(turn, sucursal, module);
            ResponseWrapper.handler(res, result, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async assistanceTurn(req: Request, res: Response) {
        try {
            const { turn, sucursal, ubication, username } = req.body;
            const result = await turnController.assistanceTurn(turn, sucursal, ubication, username);
            ResponseWrapper.handler(res, result, 201);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async reCallTurn(req: Request, res: Response) {
        try {
            const { turn, sucursal, ubication, username, source } = req.body;
            let auxUbication = ubication;
            const auxReq: any = req;
            const uname = auxReq.jwtPayload ? auxReq.jwtPayload.username : username;
            if (uname) {
                const resultModule = await moduleController.getByUser(uname);
                if (resultModule) {
                    auxUbication = resultModule.name;   
                }
            }
            const result = await turnController.reCallTurn(turn, sucursal, auxUbication, source, uname);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async cancelTurn(req: Request, res: Response) {
        try {
            const { turn, sucursal, ubication, username, source } = req.body;
            const result = await turnController.cancelOrFinishTurn(turn, sucursal, false, ubication, username, source);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async finishTurn(req: Request, res: Response) {
        try {
            const { turn, sucursal, ubication, username, source } = req.body;
            const result = await turnController.cancelOrFinishTurn(turn, sucursal, true, ubication, username, source);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async freeTurn(req: Request, res: Response) {
        try {
            const { turn, sucursal } = req.body;
            const result = await turnController.freeTurn(turn, sucursal);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async getAssistanceShifts(req: Request, res: Response) {
        try {
            const result = await turnController.getAssistanceShifts(req.params.suc);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async getAssistanceTraces(req: Request, res: Response) {
        try {
            const result = await turnController.getAssistanceTraces(req.params.suc);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async getPenddingShifts(req: Request, res: Response) {
        try {
            const result = await turnController.getPenddingShifts(req.params.suc);
            ResponseWrapper.handler(res, result, 200);
        } catch (error: any) {
            Errors.handler(error, res);
        }
    }

    async resset(req: Request, res: Response) {
        try {
            if (await turnController.migration()) {
                if (await traceTurnController.migration()) {
                    ResponseWrapper.handler(res, {message: 'Successful reboot.'}, 200);
                }
            }
        } catch (error) {
            Errors.handler(error, res);
        }
    }
}

export default new TurnRoutes().router;