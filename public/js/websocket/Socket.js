import { CLIENT_VERSION } from '../Constants.js';
import { main } from '../game.js';

let userId = null; //기본 null
let highScore = null;
let stages = null;
let items = null;
let itemUnlocks = null;
const logs = [];
const USER_ID_KEY = 'userId';

//이 주소로 연결 하겠다
//io는 html파일에 있는 socket 라이브러리
const socket = io('http://localhost:3000', {
  //컨넥션 시도 시에도 클라이언트 버전을 보내기 위한 용도
  query: {
    clientVersion: CLIENT_VERSION,
    userId: localStorage.getItem(USER_ID_KEY),
  },
});

// response 라는 이벤트명으로 받음 (Message 용)
socket.on('response', (data) => {
  console.log('response : ', data);
  if (data.status === 'fail') {
    alert(data.message);
    location.reload(true);
  }

  //broadcast
  if (data.broadcast) {
    logsDraw(data.message);
    highScore.data.score;
  }
});

// connection 이라는 이벤트명으로 받음
socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
  highScore = data.highScore;
  stages = data.assets.stages;
  items = data.assets.items;
  itemUnlocks = data.assets.itemUnlocks;

  localStorage.setItem(USER_ID_KEY, userId);

  document.getElementById('inputUserId').value = userId;
  logsDraw(`'${userId}'님이 접속하셨습니다.`);

  main();
});

//서큘러 디펜던시

const logsDraw = (message) => {
  const logs = document.getElementById('logs');
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  logs.appendChild(messageElement);
  logs.scrollTop = logs.scrollHeight;
};

export const sendEvent = (handlerId, payload) => {
  //'event' 라는 이벤트로 서버에 보냄
  socket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

//게임 데이터 테이블 정보 조회
export const getGameAssets = () => {
  return { stages, items, itemUnlocks };
};

//로그 조회
export const getLogs = () => {
  return logs;
};

//UUID 변경
export const setUserId = (uuid) => {
  userId = uuid;
  return userId;
};

// export const getUserId = () => {
//   return userId;
// };

//최고 점수 조회
export const getHighScore = () => {
  return highScore;
};
