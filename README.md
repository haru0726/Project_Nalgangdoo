# API Documentation

## 회원가입 API
**Endpoint**: `/api/sign-up`  
**Method**: `POST`  
**Description**: 사용자가 정보를 입력하면 그에 해당하는 계정을 생성한다. 관리자 코드를 입력시 관리자 권한을 가진 계정을 생성한다.  
**Request Body**:
- `userId`: (string) 유저 아이디
- `password`: (string) 비밀번호
- `passwordConfirm`: (string) 비밀번호 확인
- `userName` : (string) 유저 닉네임
- `adminCode`: (string) 관리자 회원가입 코드 (해당 코드를 입력시 관리자 권한을 가진 계정을 생성한다.)

**Response**:  
- `201 Created`: 회원가입이 완료되었습니다. / 관리자 계정 OR 일반 계정
- `400 Bad Request`: 코드가 올바르지 않습니다. / 비밀번호를 확인해주세요.
- `409 Conflict` : 이미 존재하는 아이디입니다. /이미 존재하는 닉네임입니다.

---

## JWT 토큰 검증 미들웨어
**Description**:로그인한 사용자의 토큰이 DB의 데이터와 일치하는지 검증한다. 
**Response**: 
- `401 Unauthorized`: 토큰이 없습니다.
- `403 Forbidden`: 토큰이 유효하지 않습니다.

## 로그인 API
**Endpoint**: `api/sign-in`  
**Method**: `POST`  
**Description**: 사용자가 정보를 입력하면 해당 데이터가 DB에 존재하는 값과 일치하는지 확인후 일치한다면 JWT 토큰을 발행한다.
**Request Body**:
- `userId`: (string) 유저 아이디
- `password`: (string) 비밀번호

**Response**:  
- `200 OK`: 로그인이 성공했습니다.
- `401 Unauthorized`: 존재하지 않는 아이디입니다. / 비밀번호가 일치하지 않습니다.

---

## 닉네임/비밀번호 변경 API
**Endpoint**: `/api/user-data-change`  
**Method**: `PATCH`  
**Description**: 현재 비밀번호를 입력하고 변경할 닉네임이나 비밀번호를 입력하여 현재 비밀번호와 사용자가 입력한 비밀번호가 일치한다면 사용자의 정보를 업데이트 한다.  
**Request Body**:
-`currentPassword`: (string) 현재 비밀번호
- `newUserName`: (string) 새로운 닉네임
- `newPassword`: (string) 새로운 비밀번호

**Response**:  
- `200 OK`: 사용자 정보를 업데이트 하였습니다.
- `401 Unauthorized` : 현재 비밀번호와 일치하지 않습니다.
- `404 Not Found`: 사용자를 찾을 수 없습니다.

---

## 아이디 삭제 API
**Endpoint**: `/api/account-delete`  
**Method**: `DELETE`  
**Description**: 토큰을 지닌 사용자가 현재 비밀번호를 보낸다면 토큰의 ID값과 일치하는 데이터를찾아 비밀번호를 비교하고 일치할 경우 계정을 삭제한다.  
**Request Body**:
- `password`: (string) 비밀번호

**Response**:  
- `200 OK`: 계정이 삭제되었습니다.
- `401 Unauthorized` : 비밀번호가 일치하지 않습니다.
- `404 Not Found`: 존재하지 않는 계정입니다.

---

## 캐시 구매 API
**Endpoint**: `/api/cash`  
**Method**: `PATCH`  
**Description**: 요청에서 받은 금액만큼 사용자의 계정에 추가한다.  
**Request Body**:
- `userCash` : (int) 충전할 금액

**Response**:  
- `200 OK`: 캐쉬 구매 완료~! / "현재 캐쉬": 현재 유저가 보유한 금액
- `400 Bad Request`: 값이 올바르지 않습니다.
- `404 Not Found` : 존재하지 않는 계정입니다.

---

## 보유 캐시 API
**Endpoint**: `/api/my-cash`  
**Method**: `GET`  
**Description**: 토큰을 보유한 사용자가 get요청을 보낼경우 토큰에ID와 일치하는 계정을찾아 보유간 캐시값을 보내준다.  
**Response**:  
- `200 OK`: 보유 캐시 : n원 입니다. 
- `404 Not Found`: 계정을 찾을 수 없습니다.

---

## 캐릭터 뽑기 API
**Endpoint**: `/api/character-draw`  
**Method**: `POST`  
**Description**: 토큰을 보유한 사용자가 요청한 수량에 따른 캐릭터를 응답한다. 응답시 요청한 수량에따라 n*500의 캐시를 차감한다.  
**Request Body**:
- `drawCount` : (int) 뽑기 횟수

**Response**:  
- `200 OK`: 보유 캐시 : n원 입니다. 
- `400 Bad Request`: 올바른 값을 입력하세요.
- `402 Payment Required` : 캐시가 부족합니다.
- `404 Not Found` : 존재하지 않는 계정입니다.

---

## 캐릭터 생성 API
**Endpoint**: `/api/character-data`  
**Method**: `POST`  
**Description**: 관리자 권한을 가진 계정으로 요청을 보낼경우 새로운 캐릭터를 DB에 생성한다.  
**Request Body**:
- `name`:(string) 선수의 이름
- `speed`:(int) 선수의 속도
- `goalDetermination`:(int) 선수의 골 결정력
- `shootPower`:(int) 선수의 슛 파워
- `defense`:(int) 선수의 방어력
- `stamina`:(int) 선수의 스태미나
- `star`: (int) 선수의 별 등급

**Response**:  
- `201 Created`: 캐릭터가 생성되었습니다.  
- `400 Bad Request`: 필드가 누락되었습니다. /star 필드는 4, 5, 100만 입력할 수 있습니다.
- `403 Forbidden` : 관리자 권한이 필요합니다.
- `404 Not Found` : 존재하지 않는 계정입니다.
- `409 Conflict` : 이미 존재하는 이름입니다.

---

## 선수 전체목록 조회 API
**Endpoint**: `/api/character`  
**Method**: `GET`  
**Description**: 캐릭터 생성 API로 생성한 모든 캐릭터를 조회할 수 있다. 

**Response**:  
- `200 OK`: 캐릭터 전제 목록 

---

## 선수 상세 조회 API
**Endpoint**: `/api/character/:name`  
**Method**: `GET`  
**Description**: 특정 선수의 이름을 URL에 입력하면 해당 선수의 모든 정보를 보내준다.  
**Path Parameters**:
- `name`: (string) 선수 이름

**Response**:  
- `200 OK`: 선수 상세 정보
- `404 Not Found`: 선수를 찾을 수 없음

---

## 팀 편성 API
**Endpoint**: `/api/team`  
**Method**: `POST`  
**Description**: 계정내 보유한 캐릭터로 3명의 팀원을 구성하여 하나의 팀을 만든다.  
**Request Body**:
- `TeamMembers` :  [{"name" : "프란츠 베켄바워"},{"name" : "가린샤"},{"name" : "게르트 뮐러"}]
  
**Response**:  
- `200 OK`: 팀원 편성을 완료했습니다.
- `400 Bad Request`: 팀원은 3명이어야 합니다.
- `404 Not Found` : 보유한 캐릭터 중 3명을 선택해야 합니다.

---

## 친선게임 API
**Endpoint**: `/api/games/:userId`  
**Method**: `POST`  
**Description**: 토큰을 보유한 사용자가 대결을 할 상대를 URL로 입력하여 본인을 제외한 다른 유저와 대결을 할 수 있다.
**Path Parameters**:
- `userId` : (string) 지목할 상대 

**Response**:  
- `200 OK`: 게임 시작 성공  
- `400 Bad Request`: 잘못된 요청

---

## 점수 기반 자동 매치메이킹 미들웨어
**Description**: 유저의 점수를 기반으로 자동으로 상대를 매칭하는 미들웨어.
**Response**: 
-`404 Not Found`:존재하지 않는 계정입니다. / 매칭 실패

---

## 랭크게임 API
**Endpoint**: `/api/rank-games`  
**Method**: `POST`  
**Description**: 매칭시스템을 통해 비슷한 랭크포인트를 가진 사용자와 랜덤으로 매칭된다 이를 통해 랭크포인트를 올리거나 내릴 수 있으며 티어를 변동시킬 수 있다.  
**Response**:  
- `200 OK`: 무승부 입니다! / 게임결과  
- `400 Bad Request`: 자신과는 대결할 수 없습니다. / 현재 사용자 ID가 유효하지 않습니다. / 상대 사용자 ID가 유효하지 않습니다. / 현재 사용자의 팀 구성원이 3명이 아닙니다. 상대 사용자의 팀 구성원이 3명이 아닙니다.

---

## 유저 정보 페이지 API
**Endpoint**: `/api/user-information/:userId`  
**Method**: `GET`  
**Description**: 현재 존재하는 모든 유저의 정보를 검색하여 볼 수 있다. 보고자 하는 유저의 ID를 입력하여 유저의 이름,랭크포인트,승률,티어를 볼 수 있다.  
**Path Parameters**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 유저 정보 
- `404 Not Found`: 존재하지 않는 사용자입니다.

---

## 유저 랭킹 조회 API
**Endpoint**: `/api/rankPage`  
**Method**: `GET`  
**Description**: DB의 있는 계정에 랭크 포인트에 따라 내림차순으로 순위를 정렬하여 보내준다. 

**Response**:  
- `200 OK`: 랭킹보드

---



## 선수 강화 기능 API
**Endpoint**: `/api/character-enhance`  
**Method**: `PATCH`  
**Description**: 특정 선수를 강화하는 API.  
**Path Parameters**:
- `playerId`: (string) 선수 아이디
**Request Body**:
- `enhancementItems`: (array) 강화 아이템 목록

**Response**:  
- `200 OK`: 강화 성공  
- `400 Bad Request`: 잘못된 요청

---

## 보유중인 캐릭터 조회 API
**Endpoint**: `/api/myCharacter/:userId`  
**Method**: `GET`  
**Description**: 사용자가 보유중인 캐릭터들을 조회한다.
**Path Parameters**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 보유 캐릭터 정보
- `404 Not Found`: 캐릭터가 없습니다.
---

## 캐릭터 되팔기 API
**Endpoint**: `/api/sell`  
**Method**: `POST`  
**Description**: 요청받은 캐릭터의 이름과 개수를 입력받아 입력받은 캐릭터를 그 개수만큼 판매한다.  
**Request Body**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 캐릭터 판매 완료.
- `400 Bad Request` : 잘못된 입력입니다. / 보유한 캐릭터 수량이 부족합니다.
- `401 Unauthorized` : 사용자 인증 실패. 로그인 해주세요.
- `404 Not Found`: 계정을 찾을 수 없습니다. / 캐릭터를 찾을 수 없습니다.
- 
---


## 선수강화 API
**Endpoint**: `/character-enhance`
**Method**: `PATCH` 
**Description**: 요청받은 캐릭터의 이름을 통해 강화를 진행한다
**Request Body**:

-userId: (string) 유저 아이디
-Response:

- `200 OK`: 강화 성공! / 강화 성공!(100%) 강화 실패...
- `400 Bad Request` : 최대 레벨입니다. / 재료가 충분하지 않습니다.
- `404 Not Found`: 존재하지 않는 계정입니다. / 존재하지 않는 캐릭터입니다. / 보유한 선수가 없습니다.
