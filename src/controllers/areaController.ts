import Area, { IArea } from '../models/area';

class AreaController {

    static async getAll(): Promise<IArea[]|null> {
        try {
            return await Area.find({});   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(area: string): Promise<IArea|null> {
        try {
            return await Area.findOne({name: area});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: IArea|any): Promise<IArea|null> {
        try {
            const newArea: IArea = new Area(data);    
            return await newArea.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(area: string, data: IArea): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            return await Area.updateOne({name: area}, { $set: data });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(area: string): Promise<IArea|null> {
        try {
            return await Area.findOneAndDelete({name: area});
        } catch (error: any) {
            throw error;
        }
    }
}

export default AreaController;