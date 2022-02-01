import AreaSucursal, { IAreaSucursal } from '../models/areaSucursal';

class AreaSucursalController {

    static async getAll(): Promise<IAreaSucursal[]|null> {
        try {
            return await AreaSucursal.find({});   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(sucursal: string): Promise<IAreaSucursal[]|null> {
        try {
            return await AreaSucursal.find({sucursal: sucursal});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: IAreaSucursal): Promise<IAreaSucursal|null> {
        try {
            const newData: IAreaSucursal = new AreaSucursal(data);    
            return await newData.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(area: string, data: IAreaSucursal): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            return await AreaSucursal.updateMany({area: area}, { $set: data });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(sucursal: string, area: string): Promise<IAreaSucursal|null> {
        try {
            return await AreaSucursal.findOneAndDelete({sucursal: sucursal, area: area});
        } catch (error: any) {
            throw error;
        }
    }
}

export default AreaSucursalController;