import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import userController from "../../controllers/userController";
import { Errors } from "../../utils/errors";
import { RequestExternalAPI } from "../../utils/requestExternalAPI";
import { ResponseWrapper } from "../../utils/responseWrapper";
import dotenv from "dotenv";
dotenv.config();

class AuthRoute {
    public router: Router;

    constructor() {
        this.login = this.login.bind(this);
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.route('/login').post(this.login);
    }

    async login(req: Request, res: Response) {
        try {
            const JWT_SECRET = 'BETO';
            const resExternal = await RequestExternalAPI.request('POST', '/api/login', req.body);
            if (resExternal.statusCode == 200) {
                const user = await userController.get(resExternal.body.username);

                if (user) {
                    const imageUrl = resExternal.body.urlImage != null ? resExternal.body.urlImage : '';
                    const token = jwt.sign(
                        { 
                            username: user.username, 
                            name: resExternal.body.name, 
                            firstLastName: resExternal.body.firstLastName, 
                            secondLastName: resExternal.body.secondLastName,
                            superRol: resExternal.body.superRol,
                            rol: user.rol, 
                            sucursal: resExternal.body.sucursal,
                            urlImage: imageUrl
                        },
                        JWT_SECRET || process.env.JWT_SECRET,
                        { expiresIn: "15h" }
                    );

                    ResponseWrapper.handler(res, {token}, 200);
                }
                else {
                    ResponseWrapper.handler(res, {message: 'Non-existent user.'}, 404);  
                }
            }
            else {
                ResponseWrapper.handler(res, {message: resExternal.body.message}, 401);
            };
        } catch (error: any) {
            Errors.handler(error, res);
        }
    };
}
export default new AuthRoute().router;