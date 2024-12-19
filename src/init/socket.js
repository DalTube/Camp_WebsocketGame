import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
//SocketIo셋팅
const initSocket = (server) => {
  const io = new SocketIO();
  //서버를 소켓 IO와 연결
  io.attach(server);
  //핸들러
  registerHandler(io);
};

export default initSocket;
