import jwt from 'jsonwebtoken';

export default async function (req, res, next) {
  try {
    /********
     * AccessToken을 체크
     * Case1. 토큰이 없거나 토큰에 문제가 있으면 로그인 페이지로 이동
     * Case2. 정상적인 토큰인 경우 게임화면으로 이동
     */

    // 1. 쿠키 체크
    const { accessToken } = req.cookies;

    // 2. AccessToken 없으면 Next
    if (!accessToken) {
      return next();
    }

    /********
     * 토큰 검증
     */
    const [tokenType, token] = accessToken.split(' ');

    // 3. Bearer토큰 형태 체크
    if (tokenType !== 'Bearer') throw new Error('토큰 타입이 일치하지 않습니다.');

    // 4. 복호
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const accountId = decodedToken.accountId;

    // // 2. 유저 정보 조회
    // // const account = await prisma.account.findFirst({
    // //   where: { accountId: +accountId },
    // // });
    // // if (!account) {
    // //   res.clearCookie('accessToken'); //쿠키 초기화
    // //   throw new Error('토큰 사용자가 존재하지 않습니다.');
    // // }

    // req.user에 사용자 정보를 저장합니다.
    // req.user = user.userId;

    next();
  } catch (error) {
    res.clearCookie('accessToken');
    console.log(error.name);
    // 토큰이 만료되었거나, 조작되었을 때, 에러 메시지를 다르게 출력합니다.
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      case 'JsonWebTokenError':
        return res.status(401).json({ message: '토큰이 조작되었습니다.' });
      default:
        return res.status(401).json({ message: error.message ?? '비정상적인 요청입니다.' });
    }
  }
}
