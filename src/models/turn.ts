import { model, Schema, Document } from 'mongoose';
import { IArea } from "./area";
import { ITurnState } from "./turnState";
import turnStateController from "../controllers/turnStateController";
import areaController from "../controllers/areaController";
import { RequestExternalAPI } from "../utils/requestExternalAPI";

export interface ITurn extends Document {
    turn: string; 
    area: IArea['name'];
    creationDate: Date;
    state: ITurnState['name'];
    sucursal: string;
}

const TurnoSchema: Schema = new Schema({
    turn: { type: String, required: true, index: true },
    area: { type: String, required: true, ref: 'Areas' },
    creationDate: { type: Date, required: true },
    state: { type: String, required: true, ref: 'TurnStates' },
    sucursal: { type: String, required: true, index: true }
},
{ timestamps: true })
.index({ turn: 1, sucursal: 1 }, { unique: true })
.pre("save", async function(this: ITurn, next) {
    if (this.sucursal) {
        const resExternal = await RequestExternalAPI.request('GET', `/api/sucursal/${this.sucursal}`);
        if (resExternal.statusCode != 200) {
            next(new Error(`statusCode: ${resExternal.statusCode}, message: ${resExternal.message}`));
        } 
    }

    if (this.state) {
        const state = await turnStateController.get(this.state);
        if (!state) {
            next(new Error(`Estado del turno inexistente: "${this.state}"".`));
        }
    }

    if (this.area) {
        const area = await areaController.get(this.area);
        if (!area) {
            next(new Error(`Area inexistente: "${this.area}"".`));
        }
    }
    
    next();
})
.pre("updateOne", async function(next) {
    if (this._update.$set.state) {
        const state = await turnStateController.get(this._update.$set.state);
        if (!state) {
            next(new Error(`Estado del turno inexistente: "${this._update.$set.state}"".`));
        }
    }
    
    if (this._update.$set.area) {
        const area = await areaController.get(this._update.$set.area);
        if (!area) {
            next(new Error(`Area inexistente: "${this._update.$set.area}"".`));
        }
    }

    next();
});

export default model<ITurn>('Shifts', TurnoSchema);