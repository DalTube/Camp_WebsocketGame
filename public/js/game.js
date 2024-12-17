import { getGameAssets, sendEvent } from './websocket/Socket.js';
import Player from './models/Player.js';
import Ground from './models/Ground.js';
import CactiController from './controller/CactiController.js';
import Score from './models/Score.js';
import Stage from './models/Stage.js';
import ItemController from './controller/ItemController.js';
//9번 부터 main이라는 함수에 넣는다. 메인 이라는 함수를 실행했을대 1이 나온다.

export const main = () => {
  const { stages: stageAsset, items: itemAsset, itemUnlocks: itemUnlockAsset } = getGameAssets();

  // const stageAsset = {
  //   name: 'stage',
  //   version: '1.0.0',
  //   data: [
  //     { id: 1000, score: 0, scorePerSecond: 1 },
  //     { id: 1001, score: 5, scorePerSecond: 2 },
  //     { id: 1002, score: 20, scorePerSecond: 4 },
  //     { id: 1003, score: 50, scorePerSecond: 8 },
  //   ],
  // };

  // const itemAsset = {
  //   name: 'item',
  //   version: '1.0.0',
  //   data: [
  //     { id: 1, score: 10, image: '/images/items/pokeball_red.png' },
  //     { id: 2, score: 20, image: '/images/items/pokeball_yellow.png' },
  //     { id: 3, score: 30, image: '/images/items/pokeball_purple.png' },
  //     { id: 4, score: 40, image: '/images/items/pokeball_cyan.png' },
  //   ],
  // };

  // const itemUnlockAsset = {
  //   name: 'item_unlock',
  //   version: '1.0.0',
  //   data: [
  //     { id: 101, stage_id: 1001, item_id: 1 },
  //     { id: 201, stage_id: 1002, item_id: 2 },
  //     { id: 301, stage_id: 1002, item_id: 3 },
  //     { id: 401, stage_id: 1002, item_id: 4 },
  //   ],
  // };

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const GAME_SPEED_START = 1;
  const GAME_SPEED_INCREMENT = 0.00001;

  // 게임 크기
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 200;

  // 플레이어
  // 800 * 200 사이즈의 캔버스에서는 이미지의 기본크기가 크기때문에 1.5로 나눈 값을 사용. (비율 유지)
  const PLAYER_WIDTH = 88 / 1.5; // 58
  const PLAYER_HEIGHT = 94 / 1.5; // 62
  const MAX_JUMP_HEIGHT = GAME_HEIGHT;
  const MIN_JUMP_HEIGHT = 150;

  // 땅
  const GROUND_WIDTH = 2400;
  const GROUND_HEIGHT = 24;
  const GROUND_SPEED = 0.5;

  // 선인장
  // const CACTI_CONFIG = [
  //   { width: 48 / 1.5, height: 100 / 1.5, image: 'images/cactus_1.png' },
  //   { width: 98 / 1.5, height: 100 / 1.5, image: 'images/cactus_2.png' },
  //   { width: 68 / 1.5, height: 70 / 1.5, image: 'images/cactus_3.png' },
  // ];
  const CACTI_CONFIG = [
    { width: 48 / 1.5, height: 100 / 1.5, image: '/images/cactus_1.png' },
    { width: 98 / 1.5, height: 100 / 1.5, image: '/images/cactus_2.png' },
    { width: 68 / 1.5, height: 70 / 1.5, image: '/images/cactus_3.png' },
  ];

  // 아이템
  // const ITEM_CONFIG = [
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 1, image: '/images/items/pokeball_red.png' },
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 2, image: '/images/items/pokeball_yellow.png' },
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 3, image: '/images/items/pokeball_purple.png' },
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 4, image: '/images/items/pokeball_cyan.png' },
  // ];

  const ITEM_CONFIG = [];
  itemAsset.data.forEach((item) => {
    ITEM_CONFIG.push({
      width: 50 / 1.5,
      height: 50 / 1.5,
      id: item.id,
      score: item.score,
      image: item.image,
    });
  });
  // const ITEM_CONFIG = [
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 1, image: 'images/items/pokeball_red.png' },
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 2, image: 'images/items/pokeball_yellow.png' },
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 3, image: 'images/items/pokeball_purple.png' },
  //   { width: 50 / 1.5, height: 50 / 1.5, id: 4, image: 'images/items/pokeball_cyan.png' },
  // ];

  // 게임 요소들
  let player = null;
  let ground = null;
  let cactiController = null;
  let itemController = null;
  let score = null;

  let scaleRatio = null;
  let previousTime = null;
  let gameSpeed = GAME_SPEED_START;
  let gameover = false;
  let hasAddedEventListenersForRestart = false;
  let waitingToStart = true;

  // ------- 추가 --------------
  let stage = null;
  const MAX_GAME_STAGE = stageAsset.data.length;
  const START_STAGE_ID = stageAsset.data[0].id;

  function createSprites() {
    // 비율에 맞는 크기
    // 유저
    const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
    const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
    const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
    const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

    // 땅
    const groundWidthInGame = GROUND_WIDTH * scaleRatio;
    const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

    player = new Player(ctx, playerWidthInGame, playerHeightInGame, minJumpHeightInGame, maxJumpHeightInGame, scaleRatio);

    ground = new Ground(ctx, groundWidthInGame, groundHeightInGame, GROUND_SPEED, scaleRatio);

    const cactiImages = CACTI_CONFIG.map((cactus) => {
      const image = new Image();
      image.src = cactus.image;
      return {
        image,
        width: cactus.width * scaleRatio,
        height: cactus.height * scaleRatio,
      };
    });

    cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_SPEED);

    const itemImages = ITEM_CONFIG.map((item) => {
      const image = new Image();
      image.src = item.image;
      return {
        image,
        id: item.id,
        score: item.score,
        width: item.width * scaleRatio,
        height: item.height * scaleRatio,
      };
    });
    //아이템 해금 정보, 첫스테이지Id 추가
    itemController = new ItemController(ctx, itemImages, scaleRatio, GROUND_SPEED, itemUnlockAsset.data, stageAsset.data[0].id);

    score = new Score(ctx, scaleRatio);
    //stage객체 생성시 첫 스테이지 id와 다음 스테이지 id 데이터 넘김
    stage = new Stage(ctx, scaleRatio);
  }

  function getScaleRatio() {
    const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const screenWidth = Math.min(window.innerHeight, document.documentElement.clientWidth);

    // window is wider than the game width
    if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
      return screenWidth / GAME_WIDTH;
    } else {
      return screenHeight / GAME_HEIGHT;
    }
  }

  function setScreen() {
    scaleRatio = getScaleRatio();
    canvas.width = GAME_WIDTH * scaleRatio;
    canvas.height = GAME_HEIGHT * scaleRatio;
    createSprites();
  }

  setScreen();
  window.addEventListener('resize', setScreen);

  if (screen.orientation) {
    screen.orientation.addEventListener('change', setScreen);
  }

  function showGameOver() {
    const fontSize = 70 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = 'grey';
    const x = canvas.width / 4.5;
    const y = canvas.height / 2;
    ctx.fillText('GAME OVER', x, y);
  }

  function showStartGameText() {
    const fontSize = 40 * scaleRatio;
    ctx.font = `${fontSize}px Verdana`;
    ctx.fillStyle = 'grey';
    const x = canvas.width / 14;
    const y = canvas.height / 2;
    ctx.fillText('Tap Screen or Press Space To Start', x, y);
  }

  function updateGameSpeed(deltaTime) {
    gameSpeed += deltaTime * GAME_SPEED_INCREMENT;
  }

  function reset() {
    hasAddedEventListenersForRestart = false;
    gameover = false;
    waitingToStart = false;

    ground.reset();
    cactiController.reset();
    score.reset();
    stage.reset();
    gameSpeed = GAME_SPEED_START;
    itemController.reset(START_STAGE_ID);

    // 게임시작 핸들러ID 2, payload 에는 게임 시작 시간
    sendEvent(2, { timestamp: Date.now() });
  }

  function setupGameReset() {
    if (!hasAddedEventListenersForRestart) {
      hasAddedEventListenersForRestart = true;

      setTimeout(() => {
        window.addEventListener('keyup', reset, { once: true });
      }, 1000);
    }
  }

  function clearScreen() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function gameLoop(currentTime) {
    if (previousTime === null) {
      previousTime = currentTime;
      requestAnimationFrame(gameLoop);
      return;
    }

    // 모든 환경에서 같은 게임 속도를 유지하기 위해 구하는 값
    // 프레임 렌더링 속도 (프레임당 걸리는 시간)
    const deltaTime = currentTime - previousTime;
    previousTime = currentTime;

    clearScreen();

    /***
     * 게임 시작 후 진행 상태 처리 (랜더링, 값)
     */
    if (!gameover && !waitingToStart) {
      // update
      // 땅이 움직임
      ground.update(gameSpeed, deltaTime);
      // 선인장
      cactiController.update(gameSpeed, deltaTime);
      itemController.update(gameSpeed, deltaTime, stage.getStageId());
      // 달리기
      player.update(gameSpeed, deltaTime);
      updateGameSpeed(deltaTime);

      let currnetStage = stage.getStage();
      const isStageChange = score.update(deltaTime, stageAsset.data[currnetStage - 1], currnetStage < MAX_GAME_STAGE ? stageAsset.data[currnetStage] : null);

      //스테이지가 변경되고 현재 스테이지가 마지막 스테이지가 아니면
      if (isStageChange && currnetStage < MAX_GAME_STAGE) {
        // 1. 스테이지 출력 값 수정
        stage.update(stage.getStage() + 1, stageAsset.data[currnetStage].id);
        // 2. 아이템 해금 정보 수정
        itemController.checkItemUnlockAssetByStageId(stage.getStageId());
      }
    }

    /***
     * 게임 오버가 발생 했을 때 처리 (사물과 충돌)
     */
    if (!gameover && cactiController.collideWith(player)) {
      gameover = true;
      score.setHighScore();
      setupGameReset();

      // 게임종료 핸들러ID 3, payload 에는 게임 시작 시간
      sendEvent(3, { timestamp: Date.now() });
    }

    /***
     * 아이템 획득 시 처리
     */
    const collideWithItem = itemController.collideWith(player);
    if (collideWithItem && collideWithItem.itemId) {
      console.log(collideWithItem);
      score.getItem(collideWithItem, stage.getStageId());
    }

    // draw
    player.draw();
    cactiController.draw();
    ground.draw();
    score.draw();
    itemController.draw();
    stage.draw();

    /***
     * 게임오버 상태 이후 처리
     */
    if (gameover) {
      showGameOver();
    }

    /***
     * 게임 시작 전 대기 랜더링 처리
     */
    if (waitingToStart) {
      showStartGameText();
    }

    // 재귀 호출 (무한반복)
    requestAnimationFrame(gameLoop);
  }

  /***
   * 게임 테이블 데이터를 가져오고 난 후 게임 실행을 위해 setTimeout 사용
   */
  // 게임 프레임을 다시 그리는 메서드
  requestAnimationFrame(gameLoop);

  window.addEventListener('keyup', reset, { once: true });
};
