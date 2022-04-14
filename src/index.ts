// import dotenv from "dotenv";
import server from './server';
import { getEnv } from "./enviroment";
import socketio from "socket.io";

getEnv();
// dotenv.config();
// process.env.TZ = 'America/Mexico_City';
const port = process.env.PORT;
// const mode = process.env.NODE_ENV || 'production';
// const users: any[] = [];

try {
  server.io.on("connection", async function(socket: socketio.Socket) {
    const sockets = await server.io.fetchSockets();
    console.log(sockets.length);
    // console.log(socket.handshake.query);
    // console.log(users);
  
    socket.on('newTurn', (obj) => {
      if (obj && obj.sucursal && obj.data) {
        socket.broadcast.to(obj.sucursal).emit('newTurn', obj.data); 
      }
    });
  
    socket.on('turnAttend', (obj) => {
      if (obj && obj.sucursal && obj.data) {
        socket.broadcast.to(obj.sucursal).emit('turnAttend', obj.data);
      }
    });
  
    socket.on('turnFinish', (obj) => {
      if (obj && obj.sucursal && obj.data) {
        socket.broadcast.to(obj.sucursal).emit('turnFinish', obj.data);
      }
    });
  
    socket.on('newTurnTest', (obj) => {
      if (obj && obj.sucursal && obj.type && obj.data) {
        socket.broadcast.to(`${obj.sucursal}-${obj.type}`).emit('newTurnTest', obj.data);
      }
    });
  
    socket.on('attendTurnTest', (obj) => {
      if (obj && obj.sucursal && obj.type && obj.data) {
        socket.broadcast.to(`${obj.sucursal}-${obj.type}`).emit('attendTurnTest', obj.data);
      }
    });
  
    socket.on('turnReCall', (obj) => {
      if (obj && obj.sucursal && obj.data) {
        socket.broadcast.to(obj.sucursal).emit('turnReCall', obj.data);
      }
    });
  
    socket.on('join-sucursal', (sucursal) => {
      if (sucursal) {
        socket.join(sucursal);
      }
    });
  
    socket.on('join-type', (obj) => {
      if (obj && obj.sucursal && obj.module && obj.module.type) {
        socket.join(`${obj.sucursal}-${obj.module.type}`);
      }
      
      if (obj && obj.sucursal && obj.module && obj.user) {
        socket.broadcast.to(`${obj.sucursal}`).emit('moduleLess', { module: obj.module, user: obj.user });
      }
    });
  
    socket.on('addModule', (obj) => {
      if (obj && obj.sucursal && obj.module) {
        socket.broadcast.to(`${obj.sucursal}`).emit('addModule', {module: obj.module});
      }
    });
  
    socket.on('leave-type', (obj) => {
      if (obj && obj.sucursal && obj.type) {
        socket.leave(`${obj.sucursal}-${obj.type}`);
      }
    });
  
    socket.on('leave-sucursal', (obj) => {
      if (obj && obj.sucursal) {
        socket.leave(`${obj.sucursal}`);
      }
    });
  
    socket.on('disconnect', function () {
      console.log('A user disconnected ' + socket.id);
    });
  
  
    socket.on('join-module', (obj) => {
      if (obj && obj.sucursal && obj.module) {
        socket.join(`${obj.sucursal}-${obj.module}`);
      }
    });
  
    socket.on('refresh', (obj) => {
      if (obj && obj.sucursal && obj.module) {
        socket.broadcast.to(`${obj.sucursal}-${obj.module}`).emit('refresh');
      }      
    });
  });
  
  server.http.listen(port, () => {
      console.log(`App Started on ${port}`);
  });
} catch (error) {
  console.log(error);
}
