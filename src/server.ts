import express, {Application, Request, Response, NextFunction} from 'express';
import mongoose from "mongoose";
// import router from './routes';
import routerApi from './routes/api';
import path from "path";
import CronTask, { reset, clearHistories } from './utils/cronTask';
import http from "http";
import socketio from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import fs = require('fs');

// import swaggerJsDoc from "swagger-jsdoc";
import { initDB } from "./utils/initDB";
import { getEnv } from "./enviroment";
import swaggerUi = require('swagger-ui-express');

dotenv.config();

class Server {
  public app: Application;
  public http: http.Server;
  public io: socketio.Server;

  /* Arrancan archivos Swagger */
  private swaggerFile: any = path.join(__dirname, 'swagger', 'swagger.json');
  private swaggerData: any = fs.readFileSync(this.swaggerFile, 'utf8');
  // private customCss: any = fs.readFileSync((process.cwd()+"\\swagger\\swagger.css"), 'utf8');
  private customCss: any = fs.readFileSync((path.join(__dirname, 'swagger', 'swagger.css')), 'utf8');
  private swaggerDocument = JSON.parse(this.swaggerData);

  constructor() {
    this.app = express();
    this.config();

    this.http = http.createServer(this.app);
    this.io = new socketio.Server(this.http, {
      cors: {
        origin: ["http://localhost:3000", "http://192.168.1.14:3000"],
        methods: ["GET", "POST"],
      }
    });
  }

  private config(): void {
    getEnv();
    const {MONGO_URI} = process.env;
    
    mongoose.connect(MONGO_URI || '');
    const db = mongoose.connection;

    db.on('error', function(err){
      console.log('connection error', err)
    });

    db.once('open', function(){
      console.log(`Connection to DB successful, db:${MONGO_URI}`);
      new initDB();
    });

    //CRON para reset de los turnos
    new CronTask([reset, clearHistories]);
    this.app.use(cors());
    // para aceder a los recursos de static la ruta seria "localhost:{port}/{direccion del recurso a buscar}"
    this.app.use('/', express.static(path.join(__dirname, 'static')));
    

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    
    
    this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(this.swaggerDocument, undefined, undefined, this.customCss));
    this.app.use('/api', routerApi);
  }
}

export default new Server();