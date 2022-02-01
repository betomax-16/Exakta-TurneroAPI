import User, { IUser } from '../models/user';
import rolController from "./rolController";
import { RequestExternalAPI } from "../utils/requestExternalAPI";
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";

class UserController {

    static async getAll(queries: IQueryRequest[]|null = null): Promise<IUser[]|null> {
        try {
            const myQuery = getQueriesMongo(queries);
            return await User.find(myQuery);   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(username: string): Promise<IUser|null> {
        try {
            return await User.findOne({username: username});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: IUser|any): Promise<IUser|null> {
        let createCredential: boolean = false;
        try {
            if (await rolController.get(data.rol)) {
                const user = await RequestExternalAPI.request('GET', `/api/user/${data.username}`);
                
                if (user.statusCode != 200) {
                    const resLogup = await RequestExternalAPI.request('POST', '/api/logup', data);
                    
                    if (resLogup.statusCode != 201) {
                        throw new Error(resLogup.message);
                    }
                    createCredential = true;
                    const newUser: IUser = new User(data);    
                    return await newUser.save();
                }
                else {
                    const auxUser: any = {...user.body};
                    delete auxUser._id;
                    delete auxUser.createdAt;
                    delete auxUser.updatedAt;
                    delete auxUser.__v;
                    const rol = data.rol;
                    const newUser: IUser = new User({...auxUser, rol});    
                    return await newUser.save();
                }
            }
            else {
                throw new Error("Non-existent role.");
            }
        } catch (error) {
            if (createCredential) {
                await RequestExternalAPI.request('DELETE', `/api/credentials/${data.username}`); 
            }
            
            throw error;
        }
    }

    static async update(username: string, data: IUser): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            return await User.updateOne({username: username}, { $set: {rol: data.rol} });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(username: string): Promise<IUser|null> {
        try {
            return await User.findOneAndDelete({username: username});
        } catch (error: any) {
            throw error;
        }
    }
}

export default UserController;