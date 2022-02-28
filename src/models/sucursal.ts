import { model, Schema, Document } from 'mongoose';

export interface ISucursal extends Document {
    name: string;
    color: string;
    timeLimit: number;
    print: string;
}

const SucursalSchema: Schema = new Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    timeLimit: { type: Number, required: true },
    print: { type: String, required: false }
},
{ timestamps: true });

export default model<ISucursal>('Sucursals', SucursalSchema);