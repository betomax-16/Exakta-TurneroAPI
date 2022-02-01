import { model, Schema, Document } from 'mongoose';

export interface IRol extends Document {
    name: string; 
}

const RolSchema: Schema<IRol> = new Schema<IRol>({
    name: { type: String, required: true, unique: true }
},
{ timestamps: true });

export default model<IRol>('Roles', RolSchema);