import { CLIENT_VERSION } from '../Constants.js';

//이 주소로 연결 하겠다
//io는 html파일에 있는 socket 라이브러리
const socket = io('http://localhost:3000', {
  //컨넥션 시도 시에도 클라이언트 버전을 보내기 위한 용도
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null; //기본 null

// response 라는 이벤트명으로 받음 (Message 용)
socket.on('response', (data) => {
  console.log(data);
});

// connection 이라는 이벤트명으로 받음
socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
});

const sendEvent = (handlerId, payload) => {
  //'event' 라는 이벤트로 서버에 보냄
  socket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent };
