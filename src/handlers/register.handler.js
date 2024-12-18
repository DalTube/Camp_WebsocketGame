import { addUser } from '../models/user.mode.js';
import { v4 as uuidv4 } from 'uuid';
import { handleDisconnect, handlerEvent, handleConnection } from './helper.js';
import redisClient from '../utils/redis/redis.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    try {
      //브라우저 LocalStorage의 userId
      //null이 string으로 넘어옴
      let userUUID = socket.handshake.query.userId;
      if (userUUID === 'null') {
        while (true) {
          userUUID = uuidv4();
          //UUID가 있으면 재생성
          const res = await redisClient.sIsMember('USER_ID', userUUID);
          if (res) {
            userUUID = uuidv4();
          } else {
            redisClient.sAdd('USER_ID', userUUID);
            break;
          }
        }
        addUser({ uuid: userUUID, socketId: socket.id });
        handleConnection(socket, userUUID, 'NEW');
      } else {
        const res = await redisClient.sIsMember('USER_ID', userUUID);
        if (!res) {
        }

        handleConnection(socket, userUUID, null);
      }
      //이벤트 소켓
      socket.on('event', (data) => handlerEvent(io, socket, data));

      //접속 해제시 이벤트
      socket.on('disconnect', (socket) => {
        handleDisconnect(socket, userUUID);
      });
    } catch (error) {
      throw new Error('Failed to socket connetion : ' + error.message);
    }
  });
};

export default registerHandler;
