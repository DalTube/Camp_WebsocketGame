import { addUser } from '../models/user.mode.js';
import { v4 as uuidv4 } from 'uuid';
import { handleDisconnect, handlerEvent, handleConnection } from './helper.js';
import redisClient from '../utils/redis/redis.js';

const registerHandler = (io) => {
  io.on('connection', async (socket) => {
    try {
      //브라우저 LocalStorage의 userId
      //없으면 null 값에 string 타입으로 넘어옴
      let userUUID = socket.handshake.query.userId;
      let type = null;

      if (userUUID === 'null') {
        userUUID = await createUUID();
        type = 'NEW';
      } else {
        /*******
         * 브라우지 LocalStorage에서 userId을 조작했을 경우 그냥 새로운 uuid로 발급 처리
         */
        //DB에도 ID가 있는지 확인
        const res = await redisClient.sIsMember('USER_ID', userUUID);
        if (!res) {
          //없으면 새로 생성
          userUUID = await createUUID();
          type = 'NEW';
        }
      }

      addUser({ uuid: userUUID, socketId: socket.id });
      handleConnection(socket, userUUID, type);

      //접속 해제시 이벤트
      socket.on('disconnect', (socket) => {
        handleDisconnect(socket, userUUID);
      });

      //이벤트 소켓
      socket.on('event', (data) => handlerEvent(io, socket, data));
    } catch (error) {
      handleDisconnect(socket, userUUID);
      throw new Error('Failed to socket connetion : ' + error.message);
    }
  });
};

//uuid를 생성하는 함수
const createUUID = async () => {
  try {
    let userUUID = '';
    while (true) {
      userUUID = uuidv4();
      //UUID가 있으면 재생성
      const res = await redisClient.sIsMember('USER_ID', userUUID);
      if (res) {
        userUUID = uuidv4();
      } else {
        await redisClient.sAdd('USER_ID', userUUID);
        break;
      }
    }
    return userUUID;
  } catch (error) {
    throw Error('Failed to createUUID : ' + error.message);
  }
};

export default registerHandler;
