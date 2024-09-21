import express from "express";
import UserRouter from "./src/routes/user.router.js";
import RankingRouter from "./src/routes/ranking.router.js";
import GamesRouter from "./src/routes/games.router.js";
import MyCharacterRouter from "./src/routes/myCharacter.router.js";
import CharacterSellRouter from "./src/routes/CharacterSell.router.js";
import CharacterRouter from "./src/routes/character.router.js";
import ErrorHandlingMiddleware from "./src/middlewares/error-handling.middleware.js";

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
]);

app.use(ErrorHandlingMiddleware); //에러 처리 미들웨어
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
