import express from "express";
import UserRouter from "./src/routes/user.router.js";
import TeamRouter from "./src/routes/team.router.js"; // 민석 팀 라우터 추가

const app = express();
const port = 3000;

app.use(express.json());

app.use("/api", [UserRouter, TeamRouter]); // 민석 팀 라우터 추가

// 서버 시작
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});