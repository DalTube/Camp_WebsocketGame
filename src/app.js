import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import dotenv from 'dotenv';
import redis from 'redis';
import UsersRouter from './routes/api/users.router.js';
import PagesRouter from './routes/pages/pages.router.js';
import authMiddleware from './middlewares/auth.middleware.js';
import cookieParser from 'cookie-parser';

dotenv.config(); // env환경변수 파일 가져오기

/*** Redis 연동 */
const redisClient = redis.createClient();
redisClient.connect();

redisClient.on('connect', () => {
  console.info('Redis connected!');
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

/*** Express */
const app = express();
const server = createServer(app);
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
// app.use(express.static('public/js')); //정적 서빙

app.use('/api', [UsersRouter]);
app.use('/pages', [PagesRouter]);

app.get('/', authMiddleware, (req, res, next) => {
  //authMiddleware 에서 처리된 User정보가 없으면 로그인 페이지로 있으면 게임 페이지로
  // const user = req.user;
  // if (!user) {
  //   res.redirect('/pages/sing-in');
  // } else {
  //   res.redirect('/pages/games');
  // }
  res.redirect('/pages/games');
});

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
