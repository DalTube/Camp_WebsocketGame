import { CLIENT_VERSION } from '../cosntants.js';
import { createStage } from '../models/stage.model.js';
import { getUser, removeUser } from '../models/user.mode.js';
import handlerMappings from './handlerMapping.js';
import { getGameAssets } from '../init/assets.js';

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id);
  console.log(`User disconnected: ${socket.id}`);
  console.log(`Current users`, getUser());
};

//스테이지에 따라서 더 높은 점수 획득
// 1스테이지, 0점 -> 1점씩
// 2스테이지, 1000점 -> 2점씩

export const handleConnection = (socket, uuid, type) => {
  console.log(`${type === 'NEW' ? 'NEW u' : 'U'}ser connected!: ${uuid} with socket ID ${socket.id}`);
  console.log('Current users : ', getUser());
  const assets = getGameAssets();
  createStage(uuid);

  socket.emit('connection', { uuid, assets });
};

export const handlerEvent = (io, socket, data) => {
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
  const response = handler(data.userId, data.payload);

  //모든 유저에게 보내야하는 경우
  if (response.boreadcast) {
    io.emit('response', response);
    return;
  }

  //해당 유저에게 보내야하는 경우
  socket.emit('response', response);
};
