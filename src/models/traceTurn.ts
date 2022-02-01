import { model, Schema, Document } from 'mongoose';
import turnController from "../controllers/turnController";
import turnStateController from "../controllers/turnStateController";

export interface ITraceTurn extends Document {
    turn: string; 
    startDate: Date;
    ubication: string;
    state: string;
    finalDate?: Date|null;
    username?: string;
    sucursal: string;
}

const TraceTurnSchema: Schema<ITraceTurn> = new Schema<ITraceTurn>({
    turn: { type: String, required: true },
    startDate: { type: Date, required: true },
    ubication: { type: String, required: true },
    state: { type: String, required: true },
    finalDate: { type: Date },
    username: { type: String },
    sucursal: { type: String, required: true },
},
{ timestamps: true })
.pre("save", async function(this: ITraceTurn, next) {
    // Verificar que el usuario exista en el sistema TURNERO
    if (this.turn && this.sucursal) {
        const turn = await turnController.get(this.turn, this.sucursal);
        if (!turn) {
            next(new Error(`The turn: '${this.turn}'' in sucursal: '${this.sucursal}' are not exist.`));
        }
    }
    else {
        next(new Error(`The fields 'turn' and 'sucursal' are mandatory.`));
    }

    if (this.state) {
        const state = await turnStateController.get(this.state);
        if (!state) {
            next(new Error(`Non-existent TurnStates "${this.state}"".`));
        }
    }
    next();
});

export default model<ITraceTurn>('TraceTurn', TraceTurnSchema, 'TraceTurn');