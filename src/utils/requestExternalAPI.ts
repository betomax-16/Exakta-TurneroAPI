import http from "http";
import dotenv from "dotenv";
dotenv.config();

export class RequestExternalAPI {

    public static async request(method: string, endPoint: string, body?: any): Promise<any> {
        const API_AUTH = 'localhost';
        const API_AUTH_PORT = '5000';
        return new Promise((resolve, reject) => {
            const options = {
                host: process.env.API_AUTH,
                port: process.env.API_AUTH_PORT,
                path: endPoint,
                method: method,
                headers: { 'Content-Type': 'application/json' }
            };
    
            const req = http.request(options);

            try {
                if (body) {
                    const data = new TextEncoder().encode(JSON.stringify(body));
                    req.write(data);
                }
            } catch (error) {
                throw error;
            }
            

            req.on('response', async res => {
                const data: any = await new Promise((resolve, reject) => {
                    res.on('data', d => {
                        resolve(d);
                    });
                });

                resolve(JSON.parse(data));
            });
        
            req.on('error', err => {
                reject(err);
            });

            req.end();
        });
    }
}