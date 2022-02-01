import { model, Schema, Document } from 'mongoose';
import areaSucursalController from "../controllers/areaSucursalController";
import receptionist_areaController from "../controllers/receptionist-areaController";
import turnController from "../controllers/turnController";
import modulePrivilegeController from "../controllers/modulePrivilegeController";

export interface IArea extends Document {
    name: string; 
    prefix: string;
}

const AreaSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    prefix: { type: String, required: true, unique: true }
},
{ timestamps: true })
.pre("updateOne", async function(next) {
    if (this._update.$set.name && this._update.$set.name != '') {
        const auxData: any = { area: this._update.$set.name };
        await areaSucursalController.update(this._conditions.name, auxData);
        await receptionist_areaController.update(this._conditions.name, auxData);
        await turnController.updateArea(this._conditions.name, this._update.$set.name);
        await modulePrivilegeController.updateAreas(this._conditions.name, this._update.$set.name);
    }

    next();
});

export default model<IArea>('Areas', AreaSchema);