import express from "express";
import UserRouter from "./src/routes/user.router.js";
import RankingRouter from "./src/routes/ranking.router.js";
import GamesRouter from "./src/routes/games.router.js";
import MyCharacterRouter from "./src/routes/myCharacter.router.js";
import CharacterSellRouter from "./src/routes/CharacterSell.router.js";
import CharacterRouter from "./src/routes/character.router.js";
import ErrorHandlingMiddleware from "./src/middlewares/error-handling.middleware.js";
import TeamRouter from "./src/routes/team.router.js";
const app = express();
const port = 3000;
app.use(express.json());

app.use("/api", [
  UserRouter,
  GamesRouter,
  RankingRouter,
  CharacterRouter,
  MyCharacterRouter,
  CharacterSellRouter,
  TeamRouter
]);

app.use(ErrorHandlingMiddleware); //에러 처리 미들웨어
app.listen(port, () => {
  console.log(`날강두 온라인`);
});
