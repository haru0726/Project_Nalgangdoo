import express from "express";
import { prisma } from "../utils/prisma/index.js";

const app = express();
const PORT = 3000;

async function main() { 
  let result = await prisma.Character.findMany();
  console.log(result); 
}

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});

main();