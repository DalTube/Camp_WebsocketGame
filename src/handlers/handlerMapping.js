import { gameEnd, gameStart } from './game.handler.js';
import { getItemHandler, createItemHandler } from './item.hander.js';
import { moveStageHandler } from './stage.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  11: moveStageHandler,
  21: createItemHandler,
  22: getItemHandler,
};

export default handlerMappings;
