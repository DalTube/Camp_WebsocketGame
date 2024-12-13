class Stage {
  stage = 1;

  constructor(ctx, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
  }

  update(targetStage) {
    this.stage = targetStage;
  }

  reset() {
    this.stage = 1;
  }

  getStage() {
    return this.stage;
  }

  draw() {
    const y = 20 * this.scaleRatio;
    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const stageX = this.canvas.width - 790 * this.scaleRatio;

    const stagePadded = Math.floor(this.stage).toString().padStart(1, 0);

    this.ctx.fillText(`STAGE ${stagePadded}`, stageX, y);
  }
}

export default Stage;
