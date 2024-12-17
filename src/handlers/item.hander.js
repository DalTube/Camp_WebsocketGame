import { getGameAssets } from '../init/assets.js';
import { setItem } from '../models/item.model.js';

export const getItemHandler = (uuid, payload) => {
  // 1. 데이터 테이블에서 아이템, 아이템 해제 정보 가져오기
  const { items, itemUnlocks } = getGameAssets();

  // 2. 가져온 데이터 테이블의 데이터 존재여부 체크
  if (!items) {
    return { stauts: 'fail', message: 'No items data table' };
  }

  if (!itemUnlocks) {
    return { stauts: 'fail', message: 'No itemunlocks data table' };
  }

  // 3. 유효한 아이템인지 검증
  if (!items.data.some((item) => item.id === payload.id)) {
    return { status: 'fail', message: 'Item not found' };
  }

  // 4. 아이템 정보 저장
  setItem(uuid, id);
};
