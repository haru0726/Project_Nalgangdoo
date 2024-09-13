import { userDataClient } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// 회원가입 API
router.post('/sign-up', async (req, res) => {
    try {
        const { account, password, confirmPassword, name } = req.body;

        // 사용자가 이미 존재하는지 확인
        const isExistUser = await userDataClient.account.findFirst({
            where: { account },
        });

        if (isExistUser) {
            return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 아이디 유효성 검사
        const accountRegex = /^[a-z0-9]+$/;
        if (!accountRegex.test(account)) {
            return res.status(400).json({ message: "아이디는 영어 소문자와 숫자의 조합이어야 합니다." });
        }

        // 비밀번호 길이 검사
        if (password.length < 6) {
            return res.status(400).json({ message: "비밀번호는 최소 6자 이상이어야 합니다." });
        }

        // 비밀번호 확인
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "비밀번호와 비밀번호 확인이 일치하지 않습니다." });
        }

        // 사용자 생성
        const user = await userDataClient.account.create({
            data: {
                account,
                password: hashedPassword,
                name,
            },
        });

        return res.status(201).json({
            message: "회원가입 완료되었습니다.",
            userId: user.id,
            account: user.account,
            name: user.name,
        });
    } catch (error) {
        console.error("회원가입 중 에러 발생.", error);
        return res.status(500).json({ message: "회원가입 중 에러가 발생하였습니다." });
    }
});

// 로그인 API
router.post('/sign-in', async (req, res) => {
    try {
        const { account, password } = req.body;

        // 사용자 확인
        const user = await userDataClient.account.findFirst({ where: { account } });

        if (!user) {
            return res.status(401).json({ message: "존재하지 않는 아이디입니다." });
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        // JWT 생성
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || "default-secret",
        );

        res.cookie("authorization", `Bearer ${token}`);
        return res.status(200).json({ message: "로그인 성공" });
    } catch (error) {
        console.error("로그인 중 에러 발생:", error);
        return res.status(500).json({ message: "로그인 중 에러가 발생하였습니다." });
    }
});

// 캐릭터 생성 API
router.post("/character", authMiddleware, async (req, res) => {
    const { name } = req.body;
    const accountId = req.user.id;

    try {
        // 캐릭터 이름 중복 검사
        const isExisCharacterName = await userDataClient.character.findUnique({
            where: { name },
        });

        if (isExisCharacterName) {
            return res.status(409).json({ message: "이미 존재하는 캐릭터 명입니다." });
        }

        // 캐릭터 생성
        const newCharacter = await userDataClient.character.create({
            data: {
                name,
                accountId,
                health: 500,
                power: 100,
                money: 10000,
                characterInventory: {
                    create: [], // 필요한 경우 데이터를 추가하십시오.
                },
                characterItem: {
                    create: [], // 필요한 경우 데이터를 추가하십시오.
                },
            },
            include: {
                characterInventory: true,
                characterItem: true,
            },
        });

        return res.status(201).json({ id: newCharacter.id });
    } catch (error) {
        console.error("캐릭터 생성 중 에러 발생:", error);
        return res.status(500).json({ message: "캐릭터 생성 중 오류가 발생했습니다." });
    }
});

// 캐릭터 삭제 API
router.delete("/character/:id", authMiddleware, async (req, res) => {
    const characterId = parseInt(req.params.id, 10);
    const accountId = req.user.id;

    try {
        const character = await userDataClient.character.findUnique({
            where: { id: characterId },
            include: { account: true },
        });

        if (!character) {
            return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
        }

        if (character.accountId !== accountId) {
            return res.status(403).json({ message: "해당 캐릭터를 삭제할 권한이 없습니다." });
        }

        await userDataClient.character.delete({
            where: { id: characterId },
        });

        return res.status(200).json({ message: "캐릭터가 성공적으로 삭제되었습니다." });
    } catch (error) {
        console.error("캐릭터 삭제 중 에러 발생:", error);
        return res.status(500).json({ message: "캐릭터 삭제 중 오류가 발생했습니다." });
    }
});

// 캐릭터 조회 API
router.get("/character/:id", authMiddleware, async (req, res) => {
    const characterId = parseInt(req.params.id, 10);
    const accountId = req.user.id;

    try {
        const character = await userDataClient.character.findUnique({
            where: { id: characterId },
            include: {
                account: true,
                characterInventory: true,
                characterItem: true,
            },
        });

        if (!character) {
            return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다" });
        }

        const isOwner = character.accountId === accountId;

        const characterData = {
            name: character.name,
            health: character.health,
            power: character.power,
        };

        if (isOwner) {
            characterData.money = character.money;
        }

        return res.status(200).json(characterData);
    } catch (error) {
        console.error("캐릭터 조회 중 에러 발생:", error);
        return res.status(500).json({ message: "캐릭터 조회 중 오류가 발생했습니다." });
    }
});

export default router;
