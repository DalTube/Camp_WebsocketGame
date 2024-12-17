import Item from '../models/Item.js';

class ItemController {
  INTERVAL_MIN = 0;
  // INTERVAL_MAX = 12000;
  INTERVAL_MAX = 5000;

  nextInterval = null;
  items = [];
  itemUnlockAsset = null;
  itemSpawnCount = 0; //생성 가능한 아이템 개수

  constructor(ctx, itemImages, scaleRatio, speed, itemUnlockAsset, currentStageId) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.itemImages = itemImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;

    this.setItemUnlockAsset(itemUnlockAsset, currentStageId);
    this.setNextItemTime();
  }

  setItemUnlockAsset(itemUnlockAsset, currentStageId) {
    this.itemUnlockAsset = itemUnlockAsset;
    this.checkItemUnlockAssetByStageId(currentStageId);
  }

  //해금 가능한 아이템 정보 찾기
  checkItemUnlockAssetByStageId(currentStageId) {
    this.itemUnlockAsset.forEach((item) => {
      if (item.stage_id === currentStageId) this.itemSpawnCount++;
    });
  }

  //다음 아이템 생성 시간
  setNextItemTime() {
    this.nextInterval = this.getRandomNumber(this.INTERVAL_MIN, this.INTERVAL_MAX);
  }

  //다음 아이템 생성 시간의 난수 생성
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createItem() {
    const index = this.getRandomNumber(0, this.itemSpawnCount);
    //여기서 스테이지에 맞는 아이템을 랜덤 생성 해줘야함
    const itemInfo = this.itemImages[index];
    const x = this.canvas.width * 1.5;
    const y = this.getRandomNumber(10, this.canvas.height - itemInfo.height);

    const item = new Item(this.ctx, itemInfo.id, x, y, itemInfo.width, itemInfo.height, itemInfo.image);

    this.items.push(item);
  }

  update(gameSpeed, deltaTime, currentStageId) {
    if (this.nextInterval <= 0 && this.itemSpawnCount > 0) {
      //nextInterval 시간이 0이 되면 화면에 출력해줘야함.
      this.createItem(currentStageId);
      this.setNextItemTime(); //다음 아이템의 nextInterval 설정
    }

    this.nextInterval -= deltaTime;

    this.items.forEach((item) => {
      item.update(this.speed, gameSpeed, deltaTime, this.scaleRatio);
    });

    this.items = this.items.filter((item) => item.x > -item.width);
  }

  //아이템 그리기(출력)
  draw() {
    this.items.forEach((item) => item.draw());
  }

  //아이템 획득시
  collideWith(sprite) {
    const collidedItem = this.items.find((item) => item.collideWith(sprite));
    if (collidedItem) {
      this.ctx.clearRect(collidedItem.x, collidedItem.y, collidedItem.width, collidedItem.height);
      return {
        itemId: collidedItem.id,
      };
    }
  }

  reset() {
    this.items = [];
  }
}

export default ItemController;
