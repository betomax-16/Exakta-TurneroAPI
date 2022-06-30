import { Request, Response, Router } from 'express';
import { Errors } from "../../utils/errors";
import { ResponseWrapper } from "../../utils/responseWrapper";

import { checkJwt } from "../../middlewares/auth";
import { checkPath, uploadMiddleware } from "../../middlewares/createDir";
import fs from "fs";
import path from "path";
import process from "process";
import { getEnv } from "../../enviroment";
import ad from "../../models/ad";
import { Types } from "mongoose";

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
                        .post([checkJwt, checkPath(dir), uploadMiddleware], this.save);
        this.router.route('/adds/:idFile')
                        .delete([checkJwt], this.remove)
    }

    async getAll(req: Request, res: Response) {
        const files = await ad.find({});
        ResponseWrapper.handler(res, {files: files}, 200);
    }

    async save(req: Request, res: Response) {
        if (!req.files) {
            const error = new Error('Please choose files');
            Errors.handler(error, res);
        }
        else {
            const files = req.files as any;
            for (let index = 0; index < files.length; index++) {
                const file = files['myFiles'][index];
                await ad.create({
                    url: `${req.protocol}://${req.hostname}:${PORT}/${PATH_ADDS || ''}/${file.filename}`,
                    fileName: file.filename,
                    mimeType: file.mimetype
                })
            }
            
            ResponseWrapper.handler(res, {message: 'Ok'}, 201);
        }
    }

    async remove(req: Request, res: Response) {
        const file = await ad.findById(req.params.idFile);
        if (file) {
            const filePath = MODE === 'PROD' ? path.join(process.cwd(), 'build', 'static', PATH_ADDS || '', file.fileName) :
                                      path.join(process.cwd(), 'src', 'public', PATH_ADDS || '', file.fileName); 
            fs.unlinkSync(filePath);
            await ad.deleteOne({_id: new Types.ObjectId(req.params.idFile)})
        }

        ResponseWrapper.handler(res, {}, 204);
    }
}

export default new AddsRoutes().router;