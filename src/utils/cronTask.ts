import { CronJob } from 'cron';
import moment from "moment";
import turnController from "../controllers/turnController";
import traceTurnController from "../controllers/traceTurnController";
import traceHistoryController from "../controllers/traceHistoryController";
import turnHistoryController from "../controllers/turnHistoryController";

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
                  console.log({message: 'Successful reboot.', date: moment().toString()});
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
          const date = moment();
          await traceHistoryController.deleteFrom(date.format("YYYY-MM-DD"));
          await turnHistoryController.deleteFrom(date.format("YYYY-MM-DD"));
          console.log({message: 'Successful delete history.', date: date.toString()});
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
      const date = moment();
      await traceTurnController.logout();
      console.log({message: 'Successful logout.', date: date.toString()});
    } catch (e) {
      console.error(e);
    }
  });

  if (!cronJob.running) {
    cronJob.start();
  }
}