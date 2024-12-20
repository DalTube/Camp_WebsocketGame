## 웹소켓 게임 만들기

```
.
├── assets                     // 게임 데이터
│   ├── item.json
│   ├── item_unlock.json
│   └── stage.json
├── package-lock.json
├── package.json
├── yarn.json
├── public                     // 프론트엔드
├── readme.md
└── src                        // 서버 코드
    ├── app.js
    ├── constants.js
    ├── handlers               // 비즈니스 로직
    │   ├── game.handler.js
    │   ├── handlerMapping.js
    │   ├── helper.js
    │   ├── item.handler.js
    │   ├── regiser.handler.js
    │   └── stage.handler.js
    ├── init                   // 필수 데이터, 기능 로드 (load)
    │   ├── assets.js
    │   └── socket.js
    ├── models                 // 세션 모델 관리
    │   ├── item.model.js
    │   ├── stage.model.js
    │   └── user.model.js
    └── utils                 // 유틸
        └── redis             // Redis
            └── redis

```

## 패킷 구조 설계

- 패킷 구조 (클라이언트 공통)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>handlerId</td>
<td>int</td>
<td>요청을 처리할 서버 핸들러의 ID</td>
</tr>

<tr>
<td>userId</td>
<td>int</td>
<td>요청을 보내는 유저의 ID</td>
</tr>

<tr>
<td>clientVersion</td>
<td>string</td>
<td>현재 클라이언트 버전 ("1.0.0") (고정)</td>
</tr>

<tr>
<td>payload</td>
<td>JSON</td>
<td>요청 내용</td>
</tr>
</table>

<br>

- 게임 시작 payload (handlerId: 2)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>timestamp</td>
<td>Date</td>
<td>게임 시작 요청 시 클라이언트 시간</td>
</tr>

</table>

<br>

- 게임 종료 payload (handlerId: 3)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>score</td>
<td>float</td>
<td>게임 오버 시 달성한 점수</td>
</tr>

</table>

<br>

- 스테이지 이동 요청 payload (handlerId: 11)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>currentStage</td>
<td>int</td>
<td>현재 스테이지</td>
</tr>

<tr>
<td>targetStage</td>
<td>int</td>
<td>이동하는 스테이지</td>
</tr>

<tr>
<td>score</td>
<td>int</td>
<td>현재 점수</td>
</tr>
</table>

<br>

- 아이템 획득 payload (handlerId: 15)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>itemId</td>
<td>int</td>
<td>획득하는 아이템 ID</td>
</tr>
</table>

<br>
<br>

---

<br>
<br>

- 패킷 구조 (서버 공통, highscore 제외)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>status</td>
<td>string</td>
<td>성공 시 'success', 실패 시 'fail'</td>
</tr>

<tr>
<td>message</td>
<td>string</td>
<td>성공 혹은 실패 원인에 대한 부연 설명</td>
</tr>

<tr>
<td>handlerId</td>
<td>int</td>
<td>(payload가 존재할 때) 서버에 요청한 handlerId와 동일한 Id 반환</td>
</tr>

<tr>
<td>payload</td>
<td>JSON</td>
<td>(상태 변경이 필요할 때) 게임 상태 업데이트를 위해 필요한 정보가 담긴 객체</td>
</tr>

</table>

<br>

- highscore 패킷

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>userId</td>
<td>string</td>
<td>highscore를 달성한 유저의 ID</td>
</tr>

<tr>
<td>highscore</td>
<td>float</td>
<td>현재 highscore 점수</td>
</tr>
</table>

<br>

- 게임 시작 payload (handlerId: 2)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>id</td>
<td>int</td>
<td>시작 스테이지 ID</td>
</tr>

<tr>
<td>targetScore</td>
<td>int</td>
<td>다음 라운드 필요 score</td>
</tr>

<tr>
<td>scoresPerSecond</td>
<td>int</td>
<td>이번 스테이지 초당 획득 점수</td>
</tr>

<tr>
<td>unlockedItems</td>
<td>array</td>
<td>첫 라운드 해금 아이템의 ID가 담긴 배열</td>
</tr>

</table>

<br>

- 게임 오버 payload (handlerId: 3)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>score</td>
<td>int</td>
<td>최종 점수</td>
</tr>

</table>

<br>

- 스테이지 이동 payload (handlerId: 11)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>id</td>
<td>int</td>
<td>이동하는 스테이지의 id</td>
</tr>

<tr>
<td>scoresPerSecond</td>
<td>int</td>
<td>이동하는 스테이지에서 초당 획득하는 점수</td>
</tr>

<tr>
<td>targetScore</td>
<td>int</td>
<td>다음 스테이지로 이동하기 위한 요구 점수</td>
</tr>

<tr>
<td>unlockedItemId</td>
<td>int</td>
<td>이번 스테이지에서 해금되는 아이템의 ID</td>
</tr>

</table>

<br>

- 아이템 획득 payload (handlerId: 15)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>score</td>
<td>int</td>
<td>획득한 아이템이 주는 점수</td>
</tr>

</table>
