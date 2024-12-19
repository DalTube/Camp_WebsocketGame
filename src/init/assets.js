import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

//import.meta.url : 현재 파일의 절대 경로를 불러옴;
const __filename = fileURLToPath(import.meta.url);
// console.log('__filename : ', __filename);
//현재 path의 상위 경로
const __dirname = path.dirname(__filename);
// console.log('__dirname : ', __dirname);
//최상위 경로 + assets 폴더
//기준 경로에서 , 뒤의
const basePath = path.join(__dirname, '../../assets');
// console.log('basePath : ', basePath);

let gameAssets = {};

//파일 읽는 함수
//비동기 병렬로 파일을 읽는다
const readFileAsync = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, fileName), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

//파일 정보 불러오기
export const loadGameAssets = async () => {
  try {
    const [stages, items, itemUnlocks] = await Promise.all([
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
    ]);

    gameAssets = { stages, items, itemUnlocks };
    return gameAssets;
  } catch (error) {
    throw new Error('Failed to load game assets : ' + error.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
