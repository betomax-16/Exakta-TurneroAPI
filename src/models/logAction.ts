import { model, Schema, Document } from 'mongoose';

export interface ILogAction extends Document {
    username?: string; 
    action: string;
    apiUrl?: string;
    bodyBeforeRequest: any;
    bodyRequest?: any;
    bodyResponse: any;  
    source: string;
}

const LogSchema: Schema = new Schema({
    username: { type: String },
    action: { type: String, required: true },
    apiUrl: { type: String },
    bodyBeforeRequest: { type: Object , required: true},
    bodyRequest: { type: Object },
    bodyResponse: { type: Object, required: true },
    source: { type: String, required: true },
},
{ timestamps: true });

export default model<ILogAction>('LogAction', LogSchema);