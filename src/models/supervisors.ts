import { model, Schema, Document, Types } from 'mongoose';

export interface ISupervisor extends Document {
    idModule: Types.ObjectId;
    idVigia: Types.ObjectId;
}

const SupervisorSchema: Schema = new Schema({
    idModule: { type: Schema.Types.ObjectId, ref: 'Modules', required: true },
    idVigia: { type: Schema.Types.ObjectId, ref: 'Modules', required: true },
},
{ timestamps: true });

export default model<ISupervisor>('Supervisors', SupervisorSchema);