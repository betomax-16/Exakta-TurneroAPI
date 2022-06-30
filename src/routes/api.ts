import { Router, Request, Response } from 'express';
import authRoute from './api/auth';
import userRoute from './api/user';
import moduleRoute from './api/module';
import rolRoute from './api/rol';
import areaRoute from './api/area';
import turnStateRoute from './api/turnState';
import turnHistoryRoute from "./api/turnHistory";
import receptionistAreaRoute from "./api/receptionist-area";
import turnRoute from "./api/turn";
import traceTurnRoute from "./api/traceTurn";
import traceHistoryRoute from "./api/traceHistory";
import areaSucursalRoute from "./api/areaSucursal";
import modulePrivilegeRoute from "./api/modulePrivilege";
import { ResponseWrapper } from "../utils/responseWrapper";
import supervisorsRoute from "./api/supervisors";
import configRoute from "./api/config";
import sucursalCRoute from "./api/sucursal";
import logRoute from "./api/log";
import addsRoute from "./api/adds";

class Routes {
    public router: Router;

    constructor() {
        this.router = Router();

        this.router.use(authRoute);
        this.router.use(userRoute);
        this.router.use(moduleRoute);
        this.router.use(rolRoute);
        this.router.use(areaRoute);
        this.router.use(turnStateRoute);
        this.router.use(turnHistoryRoute);
        this.router.use(receptionistAreaRoute);
        this.router.use(turnRoute);
        this.router.use(traceTurnRoute);
        this.router.use(traceHistoryRoute);
        this.router.use(areaSucursalRoute);
        this.router.use(modulePrivilegeRoute);
        this.router.use(supervisorsRoute);
        this.router.use(configRoute);
        this.router.use(sucursalCRoute);
        this.router.use(logRoute);
        this.router.use(addsRoute);

        // respuesta default en caso de solicitar a una ruta no definida
        this.router.use((req: Request, res: Response) => {
            ResponseWrapper.handler(res, {message:'Recurso no encontrado.'}, 404);
        });
    }
}

export default new Routes().router;