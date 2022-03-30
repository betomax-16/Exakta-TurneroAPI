import { model, Schema, Document } from 'mongoose';

export interface ILogError extends Document {
    sucursal?: string; 
    ubication?: string; 
    username?: string; 
    action: string;
    apiUrl?: string;
    bodyRequest?: any;
    bodyResponse: any;  
    source: string;
}

const LogSchema: Schema = new Schema({
    sucursal: { type: String },
    ubication: { type: String },
    username: { type: String },
    action: { type: String, required: true },
    apiUrl: { type: String },
    bodyRequest: { type: Object },
    bodyResponse: { type: Object, required: true },
    source: { type: String, required: true },
},
{ timestamps: true });

export default model<ILogError>('LogError', LogSchema);