import { model, Schema, Document } from 'mongoose';
import { IUser } from "./user";
import { IArea } from "./area";

export interface IReceptionist_Area extends Document {
    username: IUser['username']; 
    area: IArea['name'];
}

const Receptionist_AreaSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    area: { type: String, required: true }
},
{ timestamps: true });

export default model<IReceptionist_Area>('Receptionist_Area', Receptionist_AreaSchema, 'Receptionist_Area');