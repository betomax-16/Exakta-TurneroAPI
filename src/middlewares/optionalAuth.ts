// checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
//     return bcrypt.compareSync(unencryptedPassword, this.password);
//   }


import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ResponseWrapper } from "../utils/responseWrapper";
dotenv.config();

export const checkOptionalJwt = (req: Request, res: Response, next: NextFunction) => {
  
  
    const JWT_SECRET = 'BETO';
    const token = <string>req.headers["auth"];
    let jwtPayload;
    
    if (token) {
        //Try to validate the token and get data
        try {
            jwtPayload = <any>jwt.verify(token, JWT_SECRET || process.env.JWT_SECRET);
            res.locals.jwtPayload = jwtPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
            ResponseWrapper.handler(res, {message: 'TokenExpired'}, 401);
            return;
            }
            else {
            //If token is not valid, respond with 401 (unauthorized)
            ResponseWrapper.handler(res, {message: 'unauthorized'}, 401);
            return;
            }
        }
        
        const { username, rol } = jwtPayload;
        (req as any).jwtPayload = jwtPayload;
        next();
    }
    else {
        next(); 
    }
};