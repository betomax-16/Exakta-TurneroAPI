import dotenv from "dotenv";
import path from "path";

export const getEnv = () => {
    if (process.env.NODE_ENV) {
        const env = process.env.NODE_ENV.trim().toLowerCase();
        if (env === 'development' || env === 'test') {
            const dir = path.resolve(path.resolve(__dirname).replace('\\src', ''), `${env}.env`);
            dotenv.config({
                path: dir
            });
        }
    }
}