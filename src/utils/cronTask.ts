import { CronJob } from 'cron';
import moment from "moment-timezone";
import turnController from "../controllers/turnController";
import traceTurnController from "../controllers/traceTurnController";
import traceHistoryController from "../controllers/traceHistoryController";
import turnHistoryController from "../controllers/turnHistoryController";
import { getEnv } from "../enviroment";

getEnv();
const {TZ} = process.env;

export default class CronTask {
  constructor(fun: Function[]) {
    for (let index = 0; index < fun.length; index++) {
        fun[index]();
    }
  }
}

export function reset() {
    //0 0 * * * -> todos los dias a las 12AM
    const cronJob: CronJob = new CronJob('0 0 * * *', async () => {
        try {
          if (await turnController.migration()) {
              if (await traceTurnController.migration()) {
                  console.log({message: 'Reinicio exitoso.', date: moment().tz(TZ||'America/Mexico_City').toString()});
              }
          }
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function clearHistories() {
    //0 2 1 1 * -> todos 1 de enero a las 2AM
    const cronJob: CronJob = new CronJob('0 2 1 1 *', async () => {
        try {
          const date = moment().tz(TZ||'America/Mexico_City');
          await traceHistoryController.deleteFrom(date.format("YYYY-MM-DD"));
          await turnHistoryController.deleteFrom(date.format("YYYY-MM-DD"));
          console.log({message: 'Eliminación de datos historicos exitosa.', date: date.toString()});
        } catch (e) {
          console.error(e);
        }
    });

    if (!cronJob.running) {
        cronJob.start();
    }
}

export function logout() {
  //0 0 * * * -> todos los dias a las 9PM
  const cronJob: CronJob = new CronJob('0 21 * * *', async () => {
    try {
      const date = moment().tz(TZ||'America/Mexico_City');
      await traceTurnController.logout();
      console.log({message: 'Cierres de sesión exitoso.', date: date.toString()});
    } catch (e) {
      console.error(e);
    }
  });

  if (!cronJob.running) {
    cronJob.start();
  }
}