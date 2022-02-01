import { model, Schema, Document } from 'mongoose';

export interface ITurnState extends Document {
    name: string; 
    description: string;
}

const TurnStateSchema: Schema<ITurnState> = new Schema<ITurnState>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true }
},
{ timestamps: true });

export default model<ITurnState>('TurnStates', TurnStateSchema);