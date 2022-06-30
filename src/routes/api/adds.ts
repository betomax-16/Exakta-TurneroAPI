import { Request, Response, Router } from 'express';
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";

import { checkPath, uploadMiddleware } from "../../middlewares/createDir";
import fs from "fs";
import path from "path";
import process from "process";
import { getEnv } from "../../enviroment";

getEnv();
const {MODE, PATH_ADDS, PORT} = process.env;
const dir: string = MODE === 'PROD' ? path.join(process.cwd(), 'build', 'static', PATH_ADDS || '') :
                                      path.join(process.cwd(), 'src', 'public', PATH_ADDS || ''); 

class AddsRoutes {
    public router: Router;
    
    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/adds')
                        .get(this.getAll)
                        .post([checkPath(dir), uploadMiddleware], this.save);
    }

    getAll(req: Request, res: Response) {
        fs.readdir(dir, (err, archivos) => {
            if (err) {
                throw err;
            }

            const files = archivos.map(f => `${req.protocol}://${req.hostname}:${PORT}/${PATH_ADDS || ''}/${f}`);
            ResponseWrapper.handler(res, {files: files}, 200);
        });
    }

    save(req: Request, res: Response) {
        const files = req.files
        if (!files) {
            const error = new Error('Please choose files');
            Errors.handler(error, res);
        }

        ResponseWrapper.handler(res, {message: 'Ok'}, 200);
    }
}

export default new AddsRoutes().router;