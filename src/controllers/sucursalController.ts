import Sucursal, { ISucursal } from '../models/sucursal';

class SucursalController {

    static async getAll(): Promise<ISucursal[]|null> {
        try {
            return await Sucursal.find({});   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(name: string): Promise<ISucursal|null> {
        try {
            return await Sucursal.findOne({name: name});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ISucursal|any): Promise<ISucursal|null> {
        try {
            const newData: ISucursal = new Sucursal(data);    
            return await newData.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(name: string, data: ISucursal): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            return await Sucursal.updateOne({name: name}, { $set: data });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(name: string): Promise<ISucursal|null> {
        try {
            return await Sucursal.findOneAndDelete({name: name});
        } catch (error: any) {
            throw error;
        }
    }
}

export default SucursalController;