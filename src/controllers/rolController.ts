import Rol, { IRol } from '../models/rol';

class RoleController {

    static async getAll(): Promise<IRol[]|null> {
        try {
            return await Rol.find({});   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(rol: string): Promise<IRol|null> {
        try {
            return await Rol.findOne({name: rol});
        } catch (error) {
            throw error;
        }
    }

    static async create(name: string): Promise<IRol|null> {
        try {
            const newRol: IRol = new Rol({name: name});    
            return await newRol.save();
        } catch (error) {
            throw error;
        }
    }

    static async delete(name: string): Promise<IRol|null> {
        try {
            return await Rol.findOneAndDelete({name: name});
        } catch (error: any) {
            throw error;
        }
    }
}

export default RoleController;