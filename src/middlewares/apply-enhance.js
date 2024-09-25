import { prisma } from "../utils/prisma/index.js";

/**
 * @desc 강화 레벨에 따라 증가된 스탯 계산
 * @author 준호
 * @version 1.0
 *
 * 강화된 스탯을 따로 db에 저장하지 않으므로 강화된 스탯이 필요하면 이 미들웨어를 호출하여 사용합니다.
 * 1. 사용자가 보유한 선수 조회
 * 2. 각 선수의 각종 스탯 컬럼에 접근하여 (레벨 * 현재 스탯의 2%) 증가
 * 3. db에 업데이트 하지 않고 req.enhanceStat에 할당
 */
const applyEnhanceMiddleware = async (req, res, next) => {
  try {
    // 인증 미들웨어에서 받은 유저 아이디
    const { userId } = req.user;

    // 로그인한 유저의 정보 조회
    const account = await prisma.account.findUnique({
      where: { userId: userId },
      include: { characters: true },
    });
    if (!account) {
      return res.status(404).json({ message: "존재하지 않는 계정입니다." });
    }

    // 레벨 0 넘는 선수만 남기기
    const enhancedCharacters = account.characters.filter(
      (char) => char.level > 0
    );

    // 스탯 강화 적용된 선수 리스트
    const enhanceStat = enhancedCharacters.map((char) => {
      const enhanceWeight = 1 + char.level * 0.02; // 레벨당 2% 증가
      return {
        characterId: char.characterId,
        name: char.name,
        star: char.star,
        speed: Math.floor(char.speed * enhanceWeight),
        goalDetermination: Math.floor(char.goalDetermination * enhanceWeight),
        shootPower: Math.floor(char.shootPower * enhanceWeight),
        defense: Math.floor(char.defense * enhanceWeight),
        stamina: Math.floor(char.stamina * enhanceWeight),
      };
    });

    // 강화된 스탯을 req 객체에 할당
    req.enhanceStat = enhanceStat;

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export default applyEnhanceMiddleware;
