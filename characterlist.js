// 선수 리스트 (모든 캐릭중 보유하지 않은 건 회색처리), 개수,이름,상세 조회 
// 선수 상세조회(선수스텟 이름)
// 선수 상세조회 || 선수 리스트 
const express = require('express');
const app = express();
const port = 3000;

//캐릭터 보유 확인 버튼
app.get('/api/character-data', function(req,res) {
  // accountID req=>characterID res
	res.send(accountId);
});

//캐릭터 상세 조회 버튼 
app.get('/api/character/:characterId', function(req,res) {
  /* characterID req => characterName speed GoalDetermination
  shotPower defense stemina res */
	res.send(characterId);
});


app.listen(port, () => {
  console.log(`listening on port ${port}`);	
});
