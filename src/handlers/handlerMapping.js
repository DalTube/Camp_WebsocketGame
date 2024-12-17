import { gameEnd, gameStart } from './game.handler.js';
import { getItemHandler } from './item.hander.js';
import { moveStageHandler } from './stage.handler.js';

const handlerMappings = {
  2: gameStart,
  3: gameEnd,
  4: getItemHandler,
  11: moveStageHandler,
};

export default handlerMappings;
