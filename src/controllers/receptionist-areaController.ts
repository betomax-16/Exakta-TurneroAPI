import Receptionist_Area, { IReceptionist_Area } from '../models/receptionist-area';

class Receptionist_AreaController {

    static async getAll(): Promise<IReceptionist_Area[]|null> {
        try {
            return await Receptionist_Area.find({});   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(name: string): Promise<IReceptionist_Area[]|null> {
        try {
            return await Receptionist_Area.find({username: name});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: IReceptionist_Area): Promise<IReceptionist_Area|null> {
        try {
            const newRow: IReceptionist_Area = new Receptionist_Area(data);    
            return await newRow.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(area: string, data: IReceptionist_Area): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            return await Receptionist_Area.updateMany({area: area}, { $set: data });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(name: string, area: string): Promise<IReceptionist_Area|null> {
        try {
            return await Receptionist_Area.findOneAndDelete({name: name, area: area});
        } catch (error: any) {
            throw error;
        }
    }
}

export default Receptionist_AreaController;