import { Types } from "mongoose";
import Supervisor, { ISupervisor } from '../models/supervisors';

class SupervisorController {

    static async getById(id: string): Promise<ISupervisor[]> {
        try {
            return await Supervisor.aggregate([
                { $lookup: {
                             from: "modules",
                             localField: "idModule",
                             foreignField: "_id",
                             as: "modulo"
                           }
                },
                { $lookup: {
                             from: "modules",
                             localField: "idVigia",
                             foreignField: "_id",
                             as: "vigia"
                           }
                },
                { $match: { _id: new Types.ObjectId(id) } },
                { $unwind: "$modulo" },
                { $unwind: "$vigia" },
                { $project : { 
                    "idModule": 0,
                    "idVigia": 0
                }}
            ]);
        } catch (error) {
            throw error;
        }
    }

    static async getSupervisors(idModule: string): Promise<ISupervisor[]> {
        try {
            return await Supervisor.aggregate([
                { $lookup: {
                             from: "modules",
                             localField: "idModule",
                             foreignField: "_id",
                             as: "modulo"
                           }
                },
                { $lookup: {
                             from: "modules",
                             localField: "idVigia",
                             foreignField: "_id",
                             as: "vigia"
                           }
                },
                { $match: { idModule: new Types.ObjectId(idModule) } },
                { $unwind: "$modulo" },
                { $unwind: "$vigia" },
                { $project : { 
                    "idModule": 0,
                    "idVigia": 0
                }}
            ]);
        } catch (error) {
            throw error;
        }
    }

    static async getSlaves(idVigia: string): Promise<ISupervisor[]> {
        try {
            return await Supervisor.aggregate([
                { $lookup: {
                             from: "modules",
                             localField: "idModule",
                             foreignField: "_id",
                             as: "modulo"
                           }
                },
                { $lookup: {
                             from: "modules",
                             localField: "idVigia",
                             foreignField: "_id",
                             as: "vigia"
                           }
                },
                { $match: { idVigia: new Types.ObjectId(idVigia) } },
                { $unwind: "$modulo" },
                { $unwind: "$vigia" },
                { $project : { 
                    "idModule": 0,
                    "idVigia": 0
                }}
            ]);
        } catch (error) {
            throw error;
        }
    }

    static async create(data: ISupervisor|any): Promise<ISupervisor|null> {
        try {
            const newData: ISupervisor = new Supervisor(data);    
            return await newData.save();
        } catch (error) {
            throw error;
        }
    }

    static async delete(id: string): Promise<ISupervisor|null> {
        try {
            return await Supervisor.findByIdAndDelete(id);
        } catch (error: any) {
            throw error;
        }
    }
}

export default SupervisorController;