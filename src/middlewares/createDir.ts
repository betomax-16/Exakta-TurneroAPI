import { Request, Response, NextFunction } from "express";
import fs from "fs";
import multer from "../utils/uploadFiles";
import { Errors } from "../utils/errors";

export const checkPath = (dirName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!fs.existsSync(dirName)){
            fs.mkdirSync(dirName);
        }
    
        next();
    }
}

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction)=>{ 
    const upload = multer.array('myFiles', 12);
    upload(req, res, function (err) { 
        if (err) { 
            Errors.handler(err, res);
        } 
    next();
}) }