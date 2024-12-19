const items = {};

// 유저의 아이템 목록 생성
export const createItem = (uuid) => {
  items[uuid] = [];
};

// 유저의 아이템 획득 정보 추가
export const setItem = (uuid, itemId, score, stageId, timestamp) => {
  return items[uuid].push({ itemId, score, stageId, timestamp });
};

// 유저의 아이템 획득 목록 조회
export const getItem = (uuid) => {
  return items[uuid];
};

// 해당 유저의 아이템 목록 초기화
export const clearItem = (uuid) => {
  items[uuid] = [];
};
