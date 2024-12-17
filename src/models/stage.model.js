//key: uuid, value: array -> stage 정보는 배열
const stages = {};

//스테이지 초기화
export const createStage = (uuid) => {
  stages[uuid] = [];
};

export const getStage = (uuid) => {
  return stages[uuid];
};

export const setStage = (uuid, id, timestamp, score) => {
  return stages[uuid].push({ id, timestamp, score });
};

export const clearStage = (uuid) => {
  stages[uuid] = [];
};
