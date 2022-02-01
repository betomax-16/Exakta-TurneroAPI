declare namespace Express {
    export interface Request {
        jwtPayload?: any // I use string for example, you can put other type
    }
 }