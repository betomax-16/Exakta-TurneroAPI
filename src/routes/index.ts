import { Request, Response, Router } from 'express';
import path from "path";

class Routes {
    public router: Router;

    constructor() {
        this.router = Router();

        this.router.get('/', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'static/index.html'));
        });

        this.router.get('/_status', (req: Request, res: Response) => {
            res.status(200).send('Healthy!!!');
        });
    }
}

export default new Routes().router;