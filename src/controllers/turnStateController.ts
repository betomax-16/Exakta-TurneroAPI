import TurnState, { ITurnState } from '../models/turnState';

class TurnStateController {

    static async getAll(): Promise<ITurnState[]|null> {
        try {
            return await TurnState.find({});   
        } catch (error: any) {
            throw error;
        }
    }

    static async get(name: string): Promise<ITurnState|null> {
        try {
            return await TurnState.findOne({name: name});
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ITurnState|any): Promise<ITurnState|null> {
        try {
            const newTurnState: ITurnState = new TurnState(data);    
            return await newTurnState.save();
        } catch (error) {
            throw error;
        }
    }

    static async update(name: string, data: ITurnState): Promise<any|null> {
        if (data._id) {
            delete data._id;
        }

        try {
            return await TurnState.updateOne({name: name}, { $set: data });
        } catch (error: any) {
            throw error;
        }
    }

    static async delete(name: string): Promise<ITurnState|null> {
        try {
            return await TurnState.findOneAndDelete({name: name});
        } catch (error: any) {
            throw error;
        }
    }
}

export default TurnStateController;