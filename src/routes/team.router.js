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

// 팀 생성
router.post('/teams', async (req, res) => {
    const { name, memberIds } = req.body;

    if (memberIds.length !== 3) {
        return res.status(400).json({ error: '팀원은 정확히 3명이어야 합니다' });
    }

    try {
        const teamsCount = await prisma.team.count();
        if (teamsCount >= 5) {
            return res.status(400).json({ error: '팀은 최대 5개까지 생성할 수 있습니다' });
        }

        const team = await prisma.team.create({
            data: {
                name,
                members: {
                    connect: memberIds.map(id => ({ characterListId: id })),
                },
            },
        });
        res.status(201).json(team);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: '팀 생성 실패' });
    }
});

// 팀 이름 수정
router.put('/teams/:teamId', async (req, res) => {
    const { teamId } = req.params;
    const { name } = req.body;

    try {
        const updatedTeam = await prisma.team.update({
            where: { teamId: Number(teamId) },
            data: { name },
        });
        res.json(updatedTeam);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: '팀 이름 수정 실패' });
    }
});

// 팀원 변경
router.put('/teams/:teamId/members', async (req, res) => {
    const { teamId } = req.params;
    const { memberIds } = req.body; // 팀원 ID 배열

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ error: '팀원 ID 배열이 필요합니다' });
    }

    try {
        await prisma.team.update({
            where: { teamId: Number(teamId) },
            data: {
                members: {
                    set: memberIds.map(id => ({ characterListId: id })),
                },
            },
        });
        res.json({ message: '팀원이 변경되었습니다' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '팀원 업데이트 실패' });
    }
});


export default router;
