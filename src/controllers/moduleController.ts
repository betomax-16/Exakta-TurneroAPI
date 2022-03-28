import Module, { IModule } from '../models/module';
import { IQueryRequest, getQueriesMongo } from "../models/utils/queryRequest";
import supervisorController from "./supervisorController";
import {ClientSession} from "mongoose";

class ModuleController {

    static async getAll(jwt: any = null, queries: IQueryRequest[]|null = null): Promise<IModule[]|null> {
        try {
            let myQuery: any = {};
            if (jwt) {
                const fields: string[] = [];
                const { username, rol, sucursal } = jwt;
                myQuery = getQueriesMongo(queries);
                
                // let suc: any = null;
                // if (queries) {
                //     suc = queries.find(q => q.field === 'sucursal');
                // }
                
                switch (rol) {
                    case 'Admin':
                        break;
                    case 'Recepcionista':
                        myQuery['type'] = 'modulo';
                        // if (!suc) {
                        //     myQuery['sucursal'] = sucursal;   
                        // }

                        if (queries) {
                            queries.forEach(element => {
                                fields.push(element.field);
                            });
                        }
                        
                        if (!myQuery.username && !fields.includes('username')) {
                            myQuery['username'] = { "$in": [ null, "" ] };    
                        }
                        break;
                    case 'Vigia':
                        // if (!suc) {
                        //     myQuery['sucursal'] = sucursal;   
                        // }

                        if (queries) {
                            queries.forEach(element => {
                                fields.push(element.field);
                            });
                        }

                        if (!myQuery.type && !fields.includes('type')) {
                            myQuery['type'] = 'vigia';    
                        }
                        if (!myQuery.username && !fields.includes('username')) {
                            myQuery['username'] = { "$in": [ null, "" ] };    
                        }
                        break;
                    default:
                        break;
                }
            }
            else {
                myQuery = getQueriesMongo(queries);
            }
            
            return await Module.find(myQuery); 
        } catch (error: any) {
            throw error;
        }
    }

    static async get(name: string, sucursal: string): Promise<IModule|null> {
        try {
            return await Module.findOne({name: name, sucursal: sucursal});
        } catch (error) {
            throw error;
        }
    }

    static async getByUser(username: string): Promise<IModule|null> {
        try {
            return await Module.findOne({username: username});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: IModule): Promise<IModule|null> {
        try {
            const newModule: IModule = new Module(data);    
            return await newModule.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(name: string, suc: string, data: IModule|any, session?: ClientSession): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        const auxData: any = data;
        delete auxData.name;
        try {
            return await Module.updateOne({name: name, sucursal: suc}, { $set: auxData }, {session});
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(name: string, suc: string): Promise<IModule|null> {
        try {
            const module = await Module.findOne({name: name, sucursal: suc});
            if (module) {
                const res = await Module.findByIdAndRemove(module._id);
                if (res) {
                    if (module.type === 'modulo') {
                        const modules = await supervisorController.getSupervisors(module._id);
                        for (let index = 0; index < modules.length; index++) {
                            supervisorController.delete(modules[index]._id);
                        }
                    }
                    else if (module.type === 'vigia') {
                        const modules = await supervisorController.getSlaves(module._id);
                        for (let index = 0; index < modules.length; index++) {
                            supervisorController.delete(modules[index]._id);
                        }
                    }
                }

                return module;
            }
            else {
                throw new Error(`Módulo: ${name} no encontrado.`);
            }
        } catch (error: any) {
            throw error;
        }
    }
}

export default ModuleController;