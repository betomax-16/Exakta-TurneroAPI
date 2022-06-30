import { model, Schema, Document } from 'mongoose';

export interface IAd extends Document {
    url: string; 
    fileName: string;
    isActive: boolean;
    mimeType: string;
}

const AdSchema: Schema = new Schema({
    url: { type: String, required: true, unique: true },
    fileName: { type: String, required: true, unique: true },
    isActive: { type: Boolean, required: true, default: true },
    mimeType: { type: String, required: true },
},
{ timestamps: true });

export default model<IAd>('Ads', AdSchema);