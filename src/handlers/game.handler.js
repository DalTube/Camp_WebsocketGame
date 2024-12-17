import { getGameAssets } from '../init/assets.js';
import { clearStage, getStage, setStage } from '../models/stage.model.js';

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();
  clearStage(uuid);
  //stages 배열에서 0번째 = 첫번째 스테이지
  setStage(uuid, stages.data[0].id, payload.timestamp, 0);
  console.log('Stage: ', getStage(uuid));
  return { status: 'success' };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트는 게임 종료 시 타임스탬프와 총 점수
  const { timestamp: gameEndTime, score } = payload;
  const stages = getStage(uuid);

  if (!stages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  //각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;
  stages.forEach((stage, index) => {
    let stageEndTime;
    //
    if (index === stages.length - 1) {
      //마지막 스테이지인 경우
      stageEndTime = gameEndTime;
    } else {
      //이전 스테이지에 대한 타임스탬프를 가져온다
      stageEndTime = stages[index + 1].timestamp;
    }

    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration;
    console.log('stageDuration : ', stageDuration, 'totalScore : ', totalScore);
  });

  // 점수와 타임스탬프 검증
  // 오차범위 5
  console.log('payloadScore : ', score);
  if (Math.abs(score - totalScore) > 5) {
    return { status: 'fail', message: 'score verification failed' };
  }

  // DB 저장한다고 가정을 한다면
  // 저장
  // setResult(userId,score,timeStamp)

  return { status: 'success', message: 'Game ended', score };
};
