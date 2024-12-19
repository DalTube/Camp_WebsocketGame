//유저는 스테이지를 하나씩 올라갈 수 있다. (1스테이지 1 -> 2, 2->3)
//유저는 일정 점수가 되면 다음 스테이지로 이동한다.
import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';
import { getItem } from '../models/item.model.js';
import { SCORE_TOLERANCE } from '../cosntants.js';

export const moveStageHandler = (userId, payload) => {
  // 1.유저의 스테이지 정보 불러오기
  let currentStages = getStage(userId);
  if (!currentStages.length) {
    return { stauts: 'fail', message: 'No stages found for user' };
  }

  // 2.오름차순으로 정렬하여 ID값이 큰 스테이지를 확인(제일 큰 값이 유저의 현재 스테이지)
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 3. 클라이언트와 서버의 현재 스테이지가 맞는지 체크
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: 'Current Stage mismatch' };
  }

  // 4. 추가 검증에 사용할 스테이지 테이블 데이터 조회
  const { stages } = getGameAssets(); //스테이지 정보를 불러온다

  /*** 5. 점수 검증 로직
   * a. 경과 시간(초 단위)에 따른 점수를 획득.
   * - 스테이지 별로 진행된 시간만큼 해당 스테이지의 초당 얻는 점수를 계산해야 한다. ex) 1스테이지 = 1점 per 1s, 2스테이지 = 2점 per 1s
   * b. 아이템 획득 시 점수를 획득
   *  - 아이템을 획득 했을 때도 점수를 획득하기에 경과 시간으로만 체크하면 더 적은 시간으로 다음 스테이지의 점수를 획득하기에
   *    아이템 획득 점수만큼 차감하여 검증해야한다.
   *    ex) 1스테이지 = 1점 per 1s 인경우 2스테이지의 진입점수가 10점이면 10초가 경과해야한다. 그런데 중간에 1점자리 아이템을 1개 먹었을 경우 9초만에 진입 됨.
   * c. 오차시간 체크 필요. (5 => 임의로 정한 오차범위)
   *  - 통신 과정에서 딜레이가 발생할 수 있기에 임의의 오차 범위를 적용.
   */

  // 5-1. 기본 유효시간 계산
  const serverTime = Date.now(); // 현재 타임스탬프
  //유효시간 = 경과 시간(현재시간-현재 스테이지 진입시간) * 현재 스테이지의 초당 획득 점수
  // const elapsedTime = (serverTime - currentStage.timestamp) / 1000;
  //유효점수 = 유효시간 * 초당 점수
  const elapsedScore = (Math.abs(serverTime - currentStage.timestamp) / 1000) * stages.data[currentStages.length - 1].scorePerSecond;

  // 5-2. 현재 스테이지에서 얻은 아이템의 총 점수 계산
  let sumItemScore = 0;
  const userItems = getItem(userId);
  if (userItems.length > 0) {
    userItems.forEach((item) => {
      if (item.stageId === payload.currentStage) {
        sumItemScore += item.score;
      }
    });
  }
  // 5-3. 오차시간 적용하여 유효시간 검증
  //TargetScore : 현재점수 - 이전 스테이지 점수 - 현재 스테이지에서 획득한 아이템 총 점수
  const targetScore = payload.score - stages.data[currentStages.length - 1].score - sumItemScore;
  if (elapsedScore < targetScore - SCORE_TOLERANCE || elapsedScore > targetScore + SCORE_TOLERANCE) {
    return { status: 'fail', message: `Invalud elapsed Time : ${elapsedScore}` };
  }

  //조건문에 1개라도 맞으면 true 반환
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    //some() 내장 메소드
    return { status: 'fail', message: 'Target stage not found' };
  }

  //현재 획득한 점수가 다음 스테이지의 진입 점수보다 같거나 큰지 체크
  if (payload.score < stages.data[currentStages.length].score) {
    return { status: 'fail', message: 'Target stage not found' };
  }

  //이상 없으면 다음 스테이지 설정
  setStage(userId, payload.targetStage, serverTime, payload.score);

  return { status: 'success', message: 'Stage change success' };
};
