import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// 팀 구성 API
router.post("/teams", async (req, res) => {
    const { accountId, characterIds } = req.body; // accountId와 characterIds 배열을 받음
    try {
        // 캐릭터를 계정에 추가
        for (const characterId of characterIds) {
            await prisma.characterList.create({
                data: {
                    accountId,
                    characterId,
                    quantity: 1, // 기본값 1
                    isFormation: true, // 편성 여부
                },
            });
        }
        res.status(201).json({ message: "팀이 성공적으로 구성되었습니다." });
    } catch (error) {
        res.status(500).send("팀 구성 중 오류가 발생했습니다.");
    }
});

// 팀 조회 API
router.get("/teams/:accountId", async (req, res) => {
    const { accountId } = req.params;
    try {
        const team = await prisma.characterList.findMany({
            where: { accountId: parseInt(accountId) },
            include: { characterRelation: true },
        });
        res.json(team);
    } catch (error) {
        res.status(500).send("팀 조회 중 오류가 발생했습니다.");
    }
});

export default router;
