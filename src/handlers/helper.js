import { CLIENT_VERSION } from '../cosntants.js';
import { createStage } from '../models/stage.model.js';
import { getUser, removeUser } from '../models/user.mode.js';
import handlerMappings from './handlerMapping.js';
import { getGameAssets } from '../init/assets.js';
import redisClient from '../utils/redis/redis.js';

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id);
  console.log(`User disconnected: ${socket.id}`);
  console.log(`Current users`, getUser());
};

//스테이지에 따라서 더 높은 점수 획득
// 1스테이지, 0점 -> 1점씩
// 2스테이지, 1000점 -> 2점씩

export const handleConnection = async (socket, uuid, type) => {
  console.log(`${type === 'NEW' ? 'NEW u' : 'U'}ser connected!: ${uuid} with socket ID ${socket.id}`);
  console.log('Current users : ', getUser());

  //데이터 데이블 전체 조회
  const assets = getGameAssets();

  //해당 유저의 스테이지 생성
  createStage(uuid);

  //최고 점수 조회
  let highScore = await redisClient.hGetAll('HIGH_SCORE', 0, 1);
  let isHighScoreUser = false;
  if (Object.keys(highScore).length === 0) {
    highScore = 0;
  } else {
    //하이스코어를 달성한 유저가 접속한 경우 특정 메세지를 전달
    if (uuid === Object.keys(highScore)[0]) {
      isHighScoreUser = true;
    }

    highScore = Object.values(highScore)[0];
  }
  socket.emit('connection', { uuid, assets, highScore, isHighScoreUser });
};

export const handlerEvent = async (io, socket, data) => {
  //클라이언트 버전 체크
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
  }

  //찾은 핸들러를 실행
  const response = await handler(data.userId, data.payload);
  //모든 유저에게 보내야하는 경우
  if (response.broadcast) {
    io.emit('response', response);
    return;
  }

  //해당 유저에게 보내야하는 경우
  socket.emit('response', response);
};
