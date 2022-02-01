import { Response } from 'express';

export class ResponseWrapper {
    public static handler(res: Response, data: any, status: number, message: string = "Success") {
        let msg: string = '';
        if (status >= 100 && status < 200) {
            msg = 'Informative response';
        }
        else if (status >= 200 && status < 300) {
            msg = 'Successful response';
        }
        else if (status >= 300 && status < 400) {
            msg = 'Redirect error';
        }
        else if (status >= 400 && status < 500) {
            msg = 'Client error';
        }
        else if (status >= 500 && status < 600) {
            msg = 'Server error';
        }

        res.status(status).json({
            statusCode: status,
            body: data,
            message: msg
        });
    }
}