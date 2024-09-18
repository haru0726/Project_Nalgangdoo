import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // 헤더로 요청한 Authorization 값
    const authHeader = req.headers["authorization"];

    // 토큰만 추출
    const token = authHeader && authHeader.split(" ")[1];

    // 토큰이 없으면 인증 실패
    if (token == null)
      return res.status(401).json({ message: "토큰이 없습니다." });

    // 토큰이 있으면 검증
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "토큰이 유효하지 않습니다." });
      }

      // 유저 정보 저장
      req.user = user;

      next();
    });
  } catch (err) {
    console.log(err);
  }
};

export default authMiddleware;
