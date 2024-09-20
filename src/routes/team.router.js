import express from "express";
import { prisma } from "../utils/prisma/index.js"; 

const router = express.Router();

// 팀 생성
router.patch('/teams', async (req, res) => {
    const { characterId } = req.body;

    if (!Array.isArray(characterId) || characterId.length !== 3) {
        return res.status(400).json({ error: '팀원은 정확히 3명이어야 합니다.' });
    }

    try {
        // 팀을 데이터베이스에 저장하는 코드 
        const newTeam = await prisma.team.create({
            data: {
                members: {
                    create: characterId.map(id => ({
                        characterId: id,
                        isFormation: true
                    })),
                },
            },
        });

        res.status(201).json({ message: '팀이 성공적으로 생성되었습니다.', team: newTeam });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 오류 발생, 팀 생성에 실패했습니다.' });
    }
});

// 팀원 변경
router.patch('/teams/:teamId/members', async (req, res) => {
    const { teamId } = req.params; 
    const { characterId } = req.body;

    if (!Array.isArray(characterId) || characterId.length === 0) {
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
                characterId: { in: characterId }, // characterId로 수정
            },
            data: { isFormation: true },
        });

        res.json({ message: '팀원이 성공적으로 변경되었습니다.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '서버 오류 발생, 팀원 변경이 실패했습니다.' });
    }
});

export default router;
