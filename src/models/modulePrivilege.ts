import { model, Schema, Document } from 'mongoose';
import { IModule } from "./module";
import { IArea } from "./area";
import areaController from "../controllers/areaController";

export interface IModulePrivilege extends Document {
    moduleId: IModule['_id']; 
    area: IArea['name'];
    privilege: number;
}

const ModulePrivilegeSchema: Schema = new Schema({
    moduleId: { type: Schema.Types.ObjectId, required: true },
    area: { type: String, required: true },
    privilege: { type: Number, required: true }
},
{ timestamps: true })
.pre("save", async function(this: IModulePrivilege, next) {
    if (this.area) {
        const resArea = await areaController.get(this.area);
        if (!resArea) {
            next(new Error(`Non-existent area ${this.area}.`));
        } 
    }
    next();
})
.pre("updateOne", async function(next) {
    if (this._update.$set.area) {
        const resArea = await areaController.get(this._update.$set.area);
        if (!resArea) {
            next(new Error(`Non-existent area ${this._update.$set.area}.`));
        }
    }
    next();
});

export default model<IModulePrivilege>('ModulePrivilege', ModulePrivilegeSchema);