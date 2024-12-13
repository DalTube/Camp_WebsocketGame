import express from 'express';
import { getBasePath } from '../../utils/utils.js';
import authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

/*** 게임 Form 이동 API */
router.get('/games', (req, res, next) => {
  res.sendFile(getBasePath(import.meta.url) + '\\game.html');
});

/*** 회원가입 Form 호출 API */
router.get('/sing-up', (req, res, next) => {
  res.sendFile(getBasePath(import.meta.url) + '\\singup.html');
});

/*** 로그인 Form 호출 API */
router.get('/sing-in', (req, res, next) => {
  res.sendFile(getBasePath(import.meta.url) + '\\singin.html');
});

export default router;
