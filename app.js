import express from "express";
import { PrismaClient } from "@prisma/client";
import UserRouter from "./src/routes/user.router.js";
import TeamRouter from "./src/routes/team.router.js"; // 팀 라우터 추가

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

// 유저 라우터 등록
app.use("/api/users", UserRouter);

// 팀 라우터 등록
app.use("/api/teams", TeamRouter); // 팀 관련 API 등록

// 서버 시작
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
