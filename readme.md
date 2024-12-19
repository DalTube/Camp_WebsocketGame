# 웹소켓 게임 만들기

### 내일배움 캠프 7기

- 만들어봅시다

```
.
├── assets                     // 게임 데이터
│   ├── item.json
│   ├── item_unlock.json
│   └── stage.json
├── package-lock.json
├── package.json
├── public                     // 프론트엔드
├── readme.md
└── src                        // 서버 코드
    ├── app.js
    ├── constants.js
    ├── handlers               // 비즈니스 로직
    │   ├── game.handler.js
    │   ├── handlerMapping.js
    │   ├── helper.js
    │   ├── regiser.handler.js
    │   └── stage.handler.js
    ├── init                   // 필수 데이터, 기능 로드 (load)
    │   ├── assets.js
    │   └── socket.js
    └── models                 // 세션 모델 관리
        ├── stage.model.js
        └── user.model.js
```
