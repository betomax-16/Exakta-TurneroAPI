import { model, Schema, Document } from 'mongoose';

export interface ITurnHistory extends Document {
    turn: string; 
    area: string;
    creationDate: Date;
    state: string;
    sucursal: string;
}

const TurnHistorySchema: Schema<ITurnHistory> = new Schema<ITurnHistory>({
    turn: { type: String, required: true },
    area: { type: String, required: true },
    creationDate: { type: Date, required: true },
    state: { type: String, required: true },
    sucursal: { type: String, required: true }
},
{ timestamps: true });

export default model<ITurnHistory>('TurnHistory', TurnHistorySchema, 'TurnHistory');