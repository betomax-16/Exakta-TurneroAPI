import Config, { IConfig } from '../models/config';

class ConfigController {

    static async get(): Promise<IConfig[]|null> {
        try {
            return await Config.find({}).skip(0).limit(1);
        } catch (error) {
            throw error;
        }
    }

    static async save(data: IConfig): Promise<IConfig|null> {
        try {
            const existData = await Config.find({}).skip(0).limit(1);
            if (existData.length) {
                if (data._id) {
                    delete data._id;
                }

                return await Config.findByIdAndUpdate(existData[0]._id, data);   
            }
            else {
                const newData: IConfig = new Config(data);    
                return await newData.save();   
            }
        } catch (error) {
            throw error;
        }
    }

    static async delete(): Promise<IConfig|null> {
        try {
            return await Config.remove({});
        } catch (error: any) {
            throw error;
        }
    }
}

export default ConfigController;