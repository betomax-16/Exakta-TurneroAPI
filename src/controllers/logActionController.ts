import LogAction, { ILogAction } from '../models/logAction';

class LogErrorController {

    static async create(data: ILogAction|any): Promise<ILogAction|null> {
        try {
            const newData: ILogAction = new LogAction(data);    
            return await newData.save();
        } catch (error) {
            throw error;
        }
    }
}

export default LogErrorController;