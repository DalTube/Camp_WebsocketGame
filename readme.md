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

<tr>
<td>timestamp</td>
<td>Date</td>
<td>게임 오버 시 클라이언트 시간 (마지막 스테이지용)</td>
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
<td>현재 스테이지 ID</td>
</tr>

<tr>
<td>targetStage</td>
<td>int</td>
<td>이동하는 스테이지 ID</td>
</tr>

<tr>
<td>score</td>
<td>int</td>
<td>현재 점수</td>
</tr>
</table>

<br>

- 아이템 획득 payload (handlerId: 21)

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

<tr>
<td>currentStageId</td>
<td>int</td>
<td>현재 스테이지 ID</td>
</tr>

</table>

<br>
<br>

---

<br>
<br>

- 패킷 구조 (서버 공통)

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

</table>

<br>

- 소켓 첫 연결 패킷

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>uuid</td>
<td>string</td>
<td>유저의 uuid</td>
</tr>

<tr>
<td>highScore</td>
<td>int</td>
<td>현재 등록된 최고 점수</td>
</tr>

<tr>
<td>assets</td>
<td>array</td>
<td>스테이지,아이템,아이템 해금에 대한 게임 기준정보 데이터</td>
</tr>

</table>

- Broadcast 패킷 (게임오버 시 최고 점수 달성)

<table>
<tr>
<td>필드 명</td>
<td>타입</td>
<td>설명</td>
</tr>

<tr>
<td>broadcast</td>
<td>boolean</td>
<td>broadcast 여부</td>
</tr>

<tr>
<td>status</td>
<td>string</td>
<td>success</td>
</tr>

<tr>
<td>message</td>
<td>string</td>
<td>boradcast 메세지</td>
</tr>

<tr>
<td>score</td>
<td>float</td>
<td>highScore 점수</td>
</tr>

</table>

## 검증

- 스테이지 변경

  1. 클라이언트에서 전달 받은 현재 스테이지 정보와 다음 스테이지 정보를 기준정보 데이터와 비교하여 검증
  2. 스테이지 진입 시간과 스테이지 변경 시간을 기준으로 획득 점수 및 획득 아이템 점수까지 계산하여 유효한지 검증

- 아이템 생성

  1. 아이템 기준정보와 비교하여 검증
  2. 아이템 해금 기준정보와 비교하여 검증

- 아이템 획득

  1. 아이템 기준정보와 비교하여 검증
  2. 아이템 해금 기준정보와 비교하여 검증

- 게임 오버
  1. 획득한 총 점수에 대해서 검증
