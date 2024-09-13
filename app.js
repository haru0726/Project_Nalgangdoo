import express from "express";

const app = express();
const port = 3000;
app.use(express.json());

app.use("/api", []);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
