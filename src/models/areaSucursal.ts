import { model, Schema, Document } from 'mongoose';
import areaController from "../controllers/areaController";
import { RequestExternalAPI } from "../utils/requestExternalAPI";
import { IArea } from "./area";

export interface IAreaSucursal extends Document {
    area: IArea['name']; 
    sucursal: string;
}

const AreaSucursalSchema: Schema<IAreaSucursal> = new Schema<IAreaSucursal>({
    area: { type: String, required: true },
    sucursal: { type: String, required: true }
},
{ timestamps: true })
.index({ area: 1, sucursal: 1 }, { unique: true })
.pre("save", async function(this: IAreaSucursal, next) {
    if (this.sucursal) {
        const resExternal = await RequestExternalAPI.request('GET', `/api/sucursal/${this.sucursal}`);
        if (resExternal.statusCode != 200) {
            next(new Error(`statusCode: ${resExternal.statusCode}, message: ${resExternal.message}`));
        } 
    }

    if (this.area) {
        const area = await areaController.get(this.area);
        if (!area) {
            next(new Error(`Non-existent Area "${this.area}"".`));
        }
    }
    
    next();
});

export default model<IAreaSucursal>('AreaSucursal', AreaSucursalSchema, 'AreaSucursal');