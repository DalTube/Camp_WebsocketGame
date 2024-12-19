import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config(); // env환경변수 파일 가져오기

/*** Express */
const app = express();
const server = createServer(app);
const PORT = 3000;

app.use(
  cors({
    origin: 'http://43.203.203.28:3000', // 허용할 도메인
    credentials: true, // 쿠키 전달 허용
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

initSocket(server);

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    //이 곳에서 파일 읽음
    const assets = await loadGameAssets();
    console.log('Assets loaded success');
  } catch (error) {
    console.error('Failed to load game assets');
  }
});
