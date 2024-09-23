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
- `200 OK`: 캐쉬 구매 완료~! / "현재 캐쉬": 현재 유저가 보유한 금액액
- `400 Bad Request`: 값이 올바르지 않습니다.
- `404 Not Found` : 존재하지 않는 계정입니다.

---

## 보유 캐시 API
**Endpoint**: `/api/cash/balance`  
**Method**: `GET`  
**Description**: 유저의 보유 캐시 조회 API.  
**Query Parameters**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 캐시 조회 성공  
- `404 Not Found`: 유저를 찾을 수 없음

---

## 캐릭터 뽑기 API
**Endpoint**: `/api/character-draw`  
**Method**: `POST`  
**Description**: 캐릭터 뽑기 기능을 처리하는 API.  
**Request Body**:
- `userId`: (string) 유저 아이디
- `drawType`: (string) 뽑기 종류 (ex: 일반, 프리미엄)

**Response**:  
- `200 OK`: 뽑기 성공  
- `400 Bad Request`: 잘못된 요청

---

## 캐릭터 생성 API
**Endpoint**: `/api/character-data`  
**Method**: `POST`  
**Description**: 새로운 캐릭터를 생성하는 API.  
**Request Body**:
- `userId`: (string) 유저 아이디
- `characterName`: (string) 캐릭터 이름

**Response**:  
- `200 OK`: 생성 성공  
- `400 Bad Request`: 잘못된 요청

---

## 선수 전체목록 조회 API
**Endpoint**: `/api/character`  
**Method**: `GET`  
**Description**: 게임 내 선수 전체 목록을 조회하는 API.  

**Response**:  
- `200 OK`: 조회 성공  
- `500 Internal Server Error`: 서버 오류

---

## 선수 상세 조회 API
**Endpoint**: `/api/character/:characterId`  
**Method**: `GET`  
**Description**: 특정 선수의 상세 정보를 조회하는 API.  
**Path Parameters**:
- `playerId`: (string) 선수 아이디

**Response**:  
- `200 OK`: 조회 성공  
- `404 Not Found`: 선수를 찾을 수 없음

---

## 팀 편성 API
**Endpoint**: `/api/team`  
**Method**: `POST`  
**Description**: 유저 팀을 구성하는 API.  
**Request Body**:
- `userId`: (string) 유저 아이디
- `players`: (array) 선수 목록

**Response**:  
- `200 OK`: 편성 성공  
- `400 Bad Request`: 잘못된 요청

---

## 친선게임 API
**Endpoint**: `/api/games/:userId`  
**Method**: `POST`  
**Description**: 다른 유저와의 친선게임을 시작하는 API.  
**Request Body**:
- `userId`: (string) 유저 아이디
- `opponentId`: (string) 상대 유저 아이디

**Response**:  
- `200 OK`: 게임 시작 성공  
- `400 Bad Request`: 잘못된 요청

---

## 랭크게임 API
**Endpoint**: `/api/rank-games`  
**Method**: `POST`  
**Description**: 랭크 게임을 시작하는 API.  
**Request Body**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 게임 시작 성공  
- `400 Bad Request`: 잘못된 요청

---

## 유저 정보 페이지 API
**Endpoint**: `/api/user-information/:userId`  
**Method**: `GET`  
**Description**: 특정 유저의 정보를 조회하는 API.  
**Path Parameters**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 조회 성공  
- `404 Not Found`: 유저를 찾을 수 없음

---

## 유저 랭킹 조회 API
**Endpoint**: `/api/rankPage`  
**Method**: `GET`  
**Description**: 유저 랭킹을 조회하는 API.  

**Response**:  
- `200 OK`: 조회 성공  
- `500 Internal Server Error`: 서버 오류

---

## 점수 기반 자동 매치메이킹 미들웨어
**Description**: 유저의 점수를 기반으로 자동으로 상대를 매칭하는 미들웨어.

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
**Description**: 유저가 보유중인 캐릭터 목록을 조회하는 API.  
**Path Parameters**:
- `userId`: (string) 유저 아이디

**Response**:  
- `200 OK`: 조회 성공  
- `404 Not Found`: 유저를 찾을 수 없음

---

## 캐릭터 되팔기 API
**Endpoint**: `/api/sell`  
**Method**: `POST`  
**Description**: 보유 중인 캐릭터를 되파는 API.  
**Request Body**:
- `userId`: (string) 유저 아이디
