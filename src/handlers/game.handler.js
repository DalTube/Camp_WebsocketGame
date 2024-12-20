import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';
import { clearItem, getItem } from '../models/item.model.js';
import { SCORE_TOLERANCE } from '../cosntants.js';
import redisClient from '../utils/redis/redis.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  clearItem(uuid);
  //stages 배열에서 0번째 = 첫번째 스테이지
  setStage(uuid, stages.data[0].id, payload.timestamp, 0);
  console.log('Stage: ', getStage(uuid));
  return { status: 'success', message: 'Game start' };
};

export const gameEnd = async (uuid, payload) => {
  // 클라이언트는 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const userStages = getStage(uuid);
  const { stages } = getGameAssets();

  if (!userStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  //각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;
  userStages.forEach((stage, index) => {
    let stageEndTime;

    if (index === userStages.length - 1) {
      //마지막 스테이지인 경우
      stageEndTime = gameEndTime;
    } else {
      //이전 스테이지에 대한 타임스탬프를 가져온다
      stageEndTime = userStages[index + 1].timestamp;
    }

    //스테이지 초당 점수 조회
    let scorePerSecond = 0;
    for (let i = 0; i < stages.data.length; i++) {
      if (stages.data[i].id === stage.id) {
        scorePerSecond = stages.data[i].scorePerSecond;
        break;
      }
    }

    const stageDuration = Math.floor((stageEndTime - stage.timestamp) / 1000) * scorePerSecond;
    totalScore += stageDuration;
  });

  //획득한 아이템의 총 점수 계산
  const userItems = getItem(uuid);
  if (userItems.length > 0) {
    userItems.forEach((item) => {
      totalScore += item.score;
    });
  }

  // 점수와 타임스탬프 검증
  // 오차범위 5
  console.log('totalScore : ', totalScore, ' payloadScore : ', score);
  if (Math.abs(score - totalScore) > SCORE_TOLERANCE) {
    return { status: 'fail', message: 'score verification failed' };
  }

  // 최고 점수 확인 후 갱신 여부 처리
  const highScore = await redisClient.hGetAll('HIGH_SCORE', 0, 1);
  if (Object.keys(highScore).length === 0) {
    await redisClient.hSet('HIGH_SCORE', uuid, score);
    // 신기록 달성
    return { broadcast: true, status: 'success', message: `[전체알림] ${uuid} 님이 ${score} 점을 획득하여 최고 점수를 갱신하셨습니다 !!!`, score };
  } else {
    if (score > Number(Object.values(highScore)[0])) {
      //신기록 달성
      await redisClient.hDel('HIGH_SCORE', Object.keys(highScore)[0]);
      await redisClient.hSet('HIGH_SCORE', uuid, score);
      return { broadcast: true, status: 'success', message: `[전체알림] ${uuid} 님이 ${score} 점을 획득하여 최고 점수를 갱신하셨습니다 !!!`, score };
    } else {
      return { status: 'success', message: 'Game Over' };
    }
  }
};
