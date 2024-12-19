import { getGameAssets } from '../init/assets.js';
import { setItem } from '../models/item.model.js';

/***
 * 아이템을 획득 했을 때 유효한 아이템인지 검증 처리
 */
export const getItemHandler = (uuid, payload) => {
  // 1. 데이터 테이블에서 아이템, 아이템 해제 정보 가져오기
  const { items, itemUnlocks } = getGameAssets();

  // 2. 가져온 데이터 테이블의 데이터 존재여부 체크
  if (!items) {
    return { stauts: 'fail', message: 'No data table for item' };
  }

  if (!itemUnlocks) {
    return { stauts: 'fail', message: 'No data table for itemunlock' };
  }

  // 3. 유효한 아이템인지 검증 (itemId && Score)
  if (!items.data.some((item) => item.id === payload.itemId && item.score === payload.score)) {
    return { status: 'fail', message: 'Target item not found' };
  }

  // 4. 아이템 해금 스테이지 검증
  itemUnlocks.data.forEach((itemUnlock) => {
    if (itemUnlock.item_id === payload.itemId && itemUnlock.stage_id > payload.currentStageId) {
      return { status: 'fail', message: 'The correct item was not created.' };
    }
  });

  // 5. 아이템 정보 저장(uuid, itemId, score, stage, timestamp)
  setItem(uuid, payload.itemId, payload.score, payload.currentStageId, payload.timestamp);
  // console.log('Item: ', getItem(uuid));
  return { status: 'success', message: 'Getting item is success' };
};

/***
 * 아이템이 생성되었을 때 정상적인 아이템이 생성된 것인지 확인
 */
export const createItemHandler = (uuid, payload) => {
  // 1. 데이터 테이블에서 아이템, 아이템 해제 정보 가져오기
  const { items, itemUnlocks } = getGameAssets();

  // 2. 아이템 데이터 검증
  if (!items.data.some((item) => item.id === payload.itemId)) {
    return { status: 'fail', message: 'This item does not exist.' };
  }

  // 3. 아이템 해금 데이터 검증
  itemUnlocks.data.forEach((itemUnlock) => {
    if (itemUnlock.item_id === payload.itemId && itemUnlock.stage_id > payload.currentStageId) {
      return { status: 'fail', message: 'The correct item was not created.' };
    }
  });

  return { status: 'success', message: 'create item is success' };
};
