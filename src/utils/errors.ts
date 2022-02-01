import { Response } from 'express';
import { ResponseWrapper } from "./responseWrapper";

export class Errors {
    public static handler(error: any, res: Response) {
        if (error.code && error.code == 11000) {
            const data = { message: `Field "${Object.keys(error.keyValue)[0]}" with value ${Object.values(error.keyValue)[0]} already exists.` };
            ResponseWrapper.handler(res, data, 500); 
        }
        else if (error.message) {
            const data = {message: error.message};
            ResponseWrapper.handler(res, data, 500);
        }
        else {
            ResponseWrapper.handler(res, error, 500);
        }
    }
}