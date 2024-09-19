import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const env = process.env;

export default async (req, res, next) => {
  try {
    const authHeader = res.headers["authorization"];

    if (!authHeader) {
      throw new Error("토큰이 존재하지 않습니다.");
    }
    const [tokenType, token] = authHeader.split(" ");
    if (tokenType !== "Bearer") {
      throw new Error("토큰 타입이 잘못되었습니다.");
    }
    const decodedToken = jwt.verify(token, env.JWT_TOKEN_SECRETKEY);
    const userId = decodedToken.userId;
    const user = await prisma.account.findUnique({
      where: { userId: userId },
    });
    if (!user) {
      throw new Error("해당 토큰은 사용할 수 없습니다.");
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};
