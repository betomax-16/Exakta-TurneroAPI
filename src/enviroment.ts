import dotenv from "dotenv";
import path from "path";

export const getEnv = () => {
    if (process.env.NODE_ENV) {
        const env = process.env.NODE_ENV.trim().toLowerCase();
        if (env === 'development' || env === 'test' || env === 'production') {
            const subDir = env === 'production' ? path.join(process.cwd(), 'build') : process.cwd();
            const dir = path.resolve(subDir, `${env}.env`);
            dotenv.config({
                path: dir
            });
        }
    }
}