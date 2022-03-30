import LogError, { ILogError } from '../models/logErrors';

class LogErrorController {

    static async create(data: ILogError|any): Promise<ILogError|null> {
        try {
            const newData: ILogError = new LogError(data);    
            return await newData.save();
        } catch (error) {
            throw error;
        }
    }
}

export default LogErrorController;