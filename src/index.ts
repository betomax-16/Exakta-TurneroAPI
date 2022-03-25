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
  
    socket.on('newTurn', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('newTurn', data);
    });
  
    socket.on('turnAttend', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('turnAttend', data);
    });
  
    socket.on('turnFinish', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('turnFinish', data);
    });
  
    socket.on('newTurnTest', ({ sucursal, type, data }) => {
      socket.broadcast.to(`${sucursal}-${type}`).emit('newTurnTest', data);
    });
  
    socket.on('attendTurnTest', ({ sucursal, type, data }) => {
      socket.broadcast.to(`${sucursal}-${type}`).emit('attendTurnTest', data);
    });
  
    socket.on('turnReCall', ({ sucursal, data }) => {
      socket.broadcast.to(sucursal).emit('turnReCall', data);
    });
  
    socket.on('join-sucursal', (sucursal) => {
      socket.join(sucursal);
    });
  
    socket.on('join-type', ({ sucursal, module, user }, callback) => {
      socket.join(`${sucursal}-${module.type}`);
      if (user) {
        socket.broadcast.to(`${sucursal}`).emit('moduleLess', { module, user });
      }
    });
  
    socket.on('addModule', ({ sucursal, module }) => {
      socket.broadcast.to(`${sucursal}`).emit('addModule', {module});
    });
  
    socket.on('leave-type', ({ sucursal, type }) => {
      socket.leave(`${sucursal}-${type}`);
    });
  
    socket.on('leave-sucursal', ({ sucursal }) => {
      socket.leave(`${sucursal}`);
    });
  
    socket.on('disconnect', function () {
      console.log('A user disconnected ' + socket.id);
    });
  
  
    socket.on('join-module', ({ sucursal, module }, callback) => {
      socket.join(`${sucursal}-${module}`);
    });
  
    socket.on('refresh', ({ sucursal, module }, callback) => {
      socket.broadcast.to(`${sucursal}-${module}`).emit('refresh');
    });
  });
  
  server.http.listen(port, () => {
      console.log(`App Started on ${port}`);
  });
} catch (error) {
  console.log(error);
}
