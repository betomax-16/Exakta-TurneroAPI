import { model, Schema, Document } from 'mongoose';
import rolController from "../controllers/rolController";
import { IRol } from "./rol";

export interface IUser extends Document {
    username: string; 
    name: string;
    firstLastName: string;
    secondLastName: string;
    superRol: string;
    sucursal: string;
    urlImage: string;
    rol: IRol['name'];
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    firstLastName: { type: String, required: true },
    secondLastName: { type: String },
    superRol: { type: String },
    sucursal: { type: String, required: true },
    urlImage: { type: String },
    rol: { type: String, required: true }
},
{ timestamps: true })
.pre("updateOne", async function(next) {
    if (this._update.$set.rol && this._update.$set.rol != '') {
        if (!await rolController.get(this._update.$set.rol)) {
            next(new Error('Rol inexistente.'));
        }
    }

    next();
});

export default model<IUser>('Users', UserSchema);