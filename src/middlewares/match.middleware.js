import { prisma } from "../utils/prisma/index.js";

/**
 * @desc 랭킹 점수 기반 매치 메이킹 기능
 * @author 준호
 * @version 1.0
 *
 * 0. 로그인 계정 점수 접근
 * 1. 모든 계정 조회
 * 2. 로그인한 account rankPoint 기반으로 +- 50점인 계정 필터
 * 2-1. +- 50점인 계정이 없으면 로그인한 계정 다음으로 점수가 낮은 계정과 매칭
 * 2-2. 2-1도 없으면 로그인한 계정 다음으로 점수가 높은 계정과 매칭
 * 3. 필터한 계정에서 랜덤 뽑기
 */
const matchMiddleware = async (req, res, next) => {
  try {
    // 인증 미들웨어에서 받은 유저 아이디
    const { userId } = req.user;

    // 로그인한 유저의 정보 조회
    const account = await prisma.account.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!account) {
      return res.status(404).json({ message: "존재하지 않는 계정입니다." });
    }

    // 0. 로그인 유저 점수
    const loginUserRankPoint = account.rankPoint;

    // 1. 로그인한 계정을 제외한 모든 계정 조회
    const allUsers = await prisma.account.findMany({
      where: {
        userId: {
          not: userId, // 로그인한 계정 제외
        },
      },
    });

    // 2. rankPoint +-50점 범위의 계정 필터
    let filteredUsers = allUsers.filter(
      (enemy) =>
        enemy.rankPoint >= loginUserRankPoint - 50 &&
        enemy.rankPoint <= loginUserRankPoint + 50
    );

    // 2-1. 만약 +-50점 범위 내에 계정이 없다면 다음으로 낮은 점수의 계정 선택
    if (filteredUsers.length === 0) {
      filteredUsers = allUsers
        .filter((user) => user.rankPoint < loginUserRankPoint) // 로그인한 유저보다 낮은 점수의 계정 필터
        .sort((a, b) => b.rankPoint - a.rankPoint); // 내림차순
      // 가장 가까운 낮은 점수의 유저
      filteredUsers = [filteredUsers[0]];

      // 2-2. 낮은 점수의 계정도 없다면 다음으로 높은 점수의 계정 선택
      if (filteredUsers.length === 0) {
        filteredUsers = allUsers
          .filter((user) => user.rankPoint > loginUserRankPoint) // 로그인한 유저보다 높은 점수의 계정 필터
          .sort((a, b) => a.rankPoint - b.rankPoint); // 오름차순
        // 가장 가까운 높은 점수의 유저
        filteredUsers = [filteredUsers[0]];
      }
    }

    // 3. 필터된 계정 중 랜덤으로 하나 선택
    const matchedUser =
      filteredUsers[Math.floor(Math.random() * filteredUsers.length)];

    console.log(
      `매치 유저: ${matchedUser.userName}, 랭킹 점수: ${matchedUser.rankPoint}`
    );

    if (!matchedUser) return res.status(404).json({ message: "매칭 실패" });

    // 매칭된 유저 정보 저장
    req.matchedUser = matchedUser;

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export default matchMiddleware;
