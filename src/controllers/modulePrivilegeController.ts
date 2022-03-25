import { Types, ClientSession } from "mongoose";
import ModulePrivilege, { IModulePrivilege } from '../models/modulePrivilege';

class ModulePrivilegeController {

    static async getById(id: string): Promise<IModulePrivilege|null> {
        try {
            return await ModulePrivilege.findById(id);
        } catch (error) {
            throw error;
        }
    }

    static async get(moduleId: string, session: ClientSession|null = null): Promise<IModulePrivilege[]|null> {
        try {
            return await ModulePrivilege.find({moduleId: new Types.ObjectId(moduleId)}).session(session);
        } catch (error) {
            throw error;
        }
    }

    static async create(data: IModulePrivilege): Promise<IModulePrivilege|null> {
        try {
            const newRow: IModulePrivilege = new ModulePrivilege(data);    
            return await newRow.save();
        } catch (error) {
            throw error;
        }
    }

    static async updateAreas(oldArea: string, newArea: string): Promise<any|null> {
        try {
            return await ModulePrivilege.updateMany({area: oldArea}, { $set: {area: newArea} });
        } catch (error: any) {
            throw error;
        }
    }

    static async update(id: string, data: IModulePrivilege): Promise<any|null> {
        try {
            return await ModulePrivilege.updateOne({_id: new Types.ObjectId(id)}, { $set: data });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(id: string): Promise<IModulePrivilege|null> {
        try {
            return await ModulePrivilege.findByIdAndDelete(id);
        } catch (error: any) {
            throw error;
        }
    }
}

export default ModulePrivilegeController;