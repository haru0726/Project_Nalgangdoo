import express from "express";
import { prisma } from "../utils/prisma/index.js"; 

const router = express.Router();

// 팀 생성
router.post('/teams', async (req, res) => {
    const { name, memberIds } = req.body;

    if (memberIds.length !== 3) {
        return res.status(400).json({ error: '팀원은 정확히 3명이어야 합니다.' });
    }

    try {
        const teamsCount = await prisma.team.count();
        if (teamsCount >= 5) {
            return res.status(400).json({ error: '팀은 최대 5개까지 생성할 수 있습니다.' });
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
        res.status(500).json({ error: '팀 생성에 실패했습니다.' });
    }
});

// 팀원 변경
router.put('/teams/:teamId/members', async (req, res) => {
    const { teamId } = req.params;
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ error: '캐릭터를 보유하지 않았습니다.' });
    }

    try {
        // 기존 팀원의 isFormation을 false로 변경
        await prisma.characterList.updateMany({
            where: {
                teamId: Number(teamId),
                isFormation: true,
            },
            data: { isFormation: false },
        });

        // 새로운 팀원의 isFormation을 true로 변경
        await prisma.characterList.updateMany({
            where: {
                teamId: Number(teamId),
                characterListId: { in: memberIds },
            },
            data: { isFormation: true },
        });

        res.json({ message: '팀원이 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '팀원 업데이트에 실패했습니다.' });
    }
});

export default router;
