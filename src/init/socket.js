import { Server as SocketIO } from 'socket.io';
import registerHandler from '../handlers/register.handler.js';
//SocketIo셋팅
const initSocket = (server) => {
   const io = new SocketIO();
   io.attach(server); //서버를 소켓 IO와 연결

   //소켓을 던져줌.
   registerHandler(io);
};

export default initSocket;
