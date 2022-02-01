import { model, Schema, Document } from 'mongoose';

export interface IConfig extends Document {
    timer: number; 
}

const ConfigSchema: Schema = new Schema({
    timer: { type: Number, required: true }
},
{ timestamps: true });

export default model<IConfig>('Configurations', ConfigSchema);