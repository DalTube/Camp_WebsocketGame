import { sendEvent, getHighScore } from '../websocket/Socket.js';

class Score {
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = false;

  /*** 추가 변수 */
  second = 0; //초

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(deltaTime, currentStageData, targetStageData) {
    this.stageChange = false;
    this.second += deltaTime * 0.001;

    //1초가 지날때마다 점수 변경
    if (this.second >= 1) {
      this.second = 0; //초기화
      this.score += currentStageData.scorePerSecond; //점수 획득
    }
    Math.floor(this.score) === 10 && this.stageChange;

    /***
     * 다음 스테이지 데이터가 있고 현재 점수가 다음 스테이지의 진입 점수 이상이면 스테이지 변경
     */
    if (targetStageData && this.score >= targetStageData.score) {
      this.stageChange = true;
      sendEvent(11, { currentStage: currentStageData.id, targetStage: targetStageData.id, score: this.score });
    }

    return this.stageChange;
  }

  setStageChange(value) {
    this.stageChange = value;
  }

  getItem(item, currentStageId) {
    this.score += item.score;
    sendEvent(22, { itemId: item.itemId, score: item.score, currentStageId, timestamp: Date.now() });
  }

  reset() {
    this.score = 0;
  }

  setHighScore(score) {
    // const highScore = Number(localStorage.getItem(HIGH_SCORE_KEY));
    // if (this.score > score) {
    //   localStorage.setItem(HIGH_SCORE_KEY, Math.floor(score));
    // }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(getHighScore());
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
