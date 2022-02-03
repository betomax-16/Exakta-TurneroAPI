import rolController from "../controllers/rolController";
import areaController from "../controllers/areaController";
import turnStateController from "../controllers/turnStateController";
import userController from "../controllers/userController";
import sucursalController from "../controllers/sucursalController";
import { RequestExternalAPI } from "../utils/requestExternalAPI";

export class initDB {
    constructor() {
        try {
            this.init();
        } catch (error) {
            console.log(error);
        }
    }

    async init() {
        const roles = await rolController.getAll();
        if (roles && roles.length === 0) {
            rolController.create('Admin');
            rolController.create('Recepcionista');
            rolController.create('Vigia');
        }

        const areas = await areaController.getAll();
        if (areas && areas.length === 0) {
            areaController.create({name: 'Laboratorio', prefix: 'L'});
            areaController.create({name: 'Imagen', prefix: 'I'});
            areaController.create({name: 'Resultados', prefix: 'R'});
        }

        const stateTurns = await turnStateController.getAll();
        if (stateTurns && stateTurns.length === 0) {
            turnStateController.create({
                name: 'espera',
                description: 'Estado que señala cuando un cliente acaba de tomar su turno y esta en espera para ser atendido.'
            });
            turnStateController.create({
                name: 'en atencion',
                description: 'Estado que señala cuando un cliente esta siendo atendido por un compañero recepsionista.'
            });
            turnStateController.create({
                name: 'espera toma',
                description: 'Estado que señala cuando un cliente ya fue atendido por un compañero recepsionista y esta esperando pasar a su toma.'
            });
            turnStateController.create({
                name: 'en toma',
                description: 'Estado que señala cuando un cliente esta siendo atendido en el area de toma respectiva.'
            });
            turnStateController.create({
                name: 'terminado',
                description: 'Estado que señala cuando un cliente a culminado su ciclo de atencion.'
            });
            turnStateController.create({
                name: 'cancelado',
                description: 'Estado que señala cuando un cliente no acudio a atender su turno.'
            });
            turnStateController.create({
                name: 're-call',
                description: 'Estado que señala que se volvio a solicitar la presencia del cliente.'
            });
        }

        const users = await userController.getAll();
        if (users && users.length === 0) {
            userController.create({
                firstLastName: "Castillo",
                name: "Roberto",
                password: "beto",
                rol: "Admin",
                secondLastName: "Medina",
                sucursal: "Angelópolis",
                username: "beto"
            });
        }

        const sucursales = await sucursalController.getAll();
        if (sucursales && sucursales.length === 0) {
            const res: any = await RequestExternalAPI.request('GET', `/api/sucursal`);
            
            const sucursals = res. body;
            for (let index = 0; index < sucursals.length; index++) {
                const suc = sucursals[index];
                const data = {
                    name: suc.name,
                    color: '#fff',
                    timeLimit: 15
                };

                sucursalController.create(data);
            }
        }
    }
}