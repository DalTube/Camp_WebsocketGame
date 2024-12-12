//유저는 스테이지를 하나씩 올라갈 수 있다. (1스테이지 1 -> 2, 2->3)
//유저는 일정 점수가 되면 다음 스테이지로 이동한다.
import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';

export const moveStageHandler = (userId, payload) => {
   //유저의 현재 스테이지 정보 불러오기
   let currentStages = getStage(userId);
   if (!currentStages.length) {
      return { stauts: 'fail', message: 'No stages found for user' };
   }

   //오름차순 -> 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
   currentStages.sort((a, b) => a.id - b.id);
   const currentStage = currentStages[currentStages.length - 1];

   //클라이언트 VS 서버 비교
   if (currentStage.id !== payload.currentStage) {
      return { status: 'fail', message: 'Current Stage mismatch' };
   }

   //점수 검증 로직
   const serverTime = Date.now(); // 현재 타임스탬프
   const elapsedTime = (serverTime - currentStage.timestamp) / 1000;

   //1스테이지 -> 2스테이지로 넘어가는 가정
   //5 => 임의로 정한 오차범위
   if (elapsedTime < 5 || elapsedTime > 5.5) {
      return { status: 'fail', message: 'Invalud elapsed Time' };
   }

   //다음 스테이지 targetStage 대한 검증 <- 게임에셋에 존재하는가?
   const { stages } = getGameAssets(); //스테이지 정보를 불러온다

   //some() 내장 메소드
   //조건문에 1개라도 맞으면 true 반환
   if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
      return { status: 'fail', message: 'Target stage not found' };
   }

   //이상 없으면 다음 스테이지 설정
   setStage(userId, payload.targetStage, serverTime);

   return { status: 'success' };
};
