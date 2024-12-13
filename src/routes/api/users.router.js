import express from 'express';
import { getBasePath } from '../../utils/utils.js';

const router = express.Router();

/*** 회원가입 등록 API */
router.post('/users/sing-up', (req, res, next) => {
  res.sendFile(getBasePath(import.meta.url) + '\\singin.html');
});

/*** 로그인 API */
router.post('/users/sing-in', (req, res, next) => {
  res.sendFile(getBasePath(import.meta.url) + '\\singup.html');
});

export default router;
