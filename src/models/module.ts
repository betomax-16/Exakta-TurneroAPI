import { model, Schema, Document } from 'mongoose';
import { IUser } from "./user";
import userController from "../controllers/userController";
import moduleController from "../controllers/moduleController";
import { RequestExternalAPI } from "../utils/requestExternalAPI";

export interface IModule extends Document {
    name: string;
    type: string;
    status: boolean;
    username?: IUser['username'];
    sucursal: string;
    mode: string;
    isPrivilegeByArrivalTime: boolean;
}

const ModuloSchema: Schema = new Schema({
    name: { type: String, required: true, index: true },
    type: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
    username: { type: String, ref:'users', index: true },
    sucursal: { type: String, required: true, index: true },
    mode: { type: String, required: true, default: 'auto' },
    isPrivilegeByArrivalTime: { type: Boolean, required: true, default: false },
},
{ timestamps: true })
.index({ username: 1, name: 1, sucursal: 1 }, { unique: true })
.pre("save", async function(this: IModule, next) {
    if (this.sucursal) {
        const resExternal = await RequestExternalAPI.request('GET', `/api/sucursal/${this.sucursal}`);
        if (resExternal.statusCode != 200) {
            next(new Error(`statusCode: ${resExternal.statusCode}, message: ${resExternal.message}`));
        } 
    }
    
    // Verificar que el usuario exista en el sistema TURNERO
    if (this.username) {
        const user = await userController.get(this.username);
        if (!user) {
            next(new Error(`Non-existent user ${this.username}.`));
        }
        else {
            // Verificar que el usuario no este logueado en otra maquina(Modulo)[modulo, vigia, admin]
            const res = await moduleController.getAll();
            if (res) {
                for (let index = 0; index < res.length; index++) {
                    if (res[index].username && res[index].username == this.username) {
                        next(new Error(`User ${this.username} is operating another module ( ${res[index].name} ).`));
                    }
                }
            }
        }
    }
    next();
})
.pre("updateOne", async function(next) {
    if (this._update.$set.sucursal) {
        const resExternal = await RequestExternalAPI.request('GET', `/api/sucursal/${this._update.$set.sucursal}`);
        if (resExternal.statusCode != 200) {
            next(new Error(`statusCode: ${resExternal.statusCode}, message: ${resExternal.message}`));
        } 
    }
    // Verificar que el usuario exista en el sistema TURNERO
    if (this._update.$set.username && this._update.$set.username != '') {
        const user = await userController.get(this._update.$set.username);
        if (!user) {
            next(new Error(`Non-existent user ${this._update.$set.username}.`));
        }
        // Verificar que el usuario no este logueado en otra maquina(Modulo)[modulo, vigia, admin]
        else {
            const res = await moduleController.getAll();
            if (res) {
                for (let index = 0; index < res.length; index++) {
                    if (res[index].username && res[index].username == this._update.$set.username) {
                        next(new Error(`User ${this._update.$set.username} is operating another module ( ${res[index].name} ).`));
                    }
                }
            }
        }
    }

    next();
});

export default model<IModule>('Modules', ModuloSchema);