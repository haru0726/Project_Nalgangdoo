import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();
/**
 * @desc 선수 전체 목록 조회 API
 *
 * @author 우종
 *
 * @abstract 게임에 있는 모든 선수의 목록을 보여준다.
 */
router.get("/character", async (req, res, next) => {
  const character = await prisma.character.findMany({
    select: {
      name: true,
    },
  });
  return res.status(200).json(character);
});

/**
 * @desc 선수 상세 조회 API
 *
 * @author 우종
 *
 * @abstract 게임에 있는 모든 선수중 원하는 캐릭터의 이름 스탯 등의 상세 정보를 보여준다.
 */

router.get("/character/:characterId", async (req, res, next) => {
  try {
    const { characterId } = req.params;
    const character = await prisma.character.findFirst({
      where: { characterId: parseInt(characterId, 10) },
      select: {
        name: true,
        speed: true,
        goalDetermination: true,
        shootPower: true,
        defense: true,
        stamina: true,
      },
    });
    if (!character) {
      return res.status(404).json({ message: "선수를 찾을 수 없습니다." });
    }
    return res.status(200).json(character);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
});
export default router;
