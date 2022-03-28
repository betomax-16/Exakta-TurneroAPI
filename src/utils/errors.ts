import { Response } from 'express';
import { ResponseWrapper } from "./responseWrapper";

export class Errors {
    public static handler(error: any, res: Response) {
        if (error.code && error.code == 11000) {
            const data = { message: `Campo "${Object.keys(error.keyValue)[0]}" con el valor ${Object.values(error.keyValue)[0]} ya existente.` };
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