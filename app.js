import express from "express";
import UserRouter from "./src/routes/user.router.js";
import GamesRouter from "./src/routes/games.router.js";
const app = express();
const port = 3000;
app.use(express.json());

app.use("/api", [UserRouter, GamesRouter]);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
