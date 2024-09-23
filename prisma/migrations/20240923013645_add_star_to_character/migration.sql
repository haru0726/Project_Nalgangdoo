-- CreateTable
CREATE TABLE `Account` (
    `accountId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `userCash` INTEGER NOT NULL DEFAULT 5000,
    `winCount` INTEGER NOT NULL DEFAULT 0,
    `loseCount` INTEGER NOT NULL DEFAULT 0,
    `drowCount` INTEGER NOT NULL DEFAULT 0,
    `rankPoint` INTEGER NOT NULL DEFAULT 100,
    `super` BOOLEAN NOT NULL DEFAULT false,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Account_userId_key`(`userId`),
    UNIQUE INDEX `Account_userName_key`(`userName`),
    PRIMARY KEY (`accountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Character` (
    `characterId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `star` INTEGER NOT NULL DEFAULT 4,
    `speed` INTEGER NOT NULL,
    `goalDetermination` INTEGER NOT NULL,
    `shootPower` INTEGER NOT NULL,
    `defense` INTEGER NOT NULL,
    `stamina` INTEGER NOT NULL,

    UNIQUE INDEX `Character_name_key`(`name`),
    PRIMARY KEY (`characterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CharacterList` (
    `characterListId` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` INTEGER NOT NULL,
    `characterId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `isFormation` BOOLEAN NOT NULL DEFAULT false,
    `level` INTEGER NOT NULL DEFAULT 0,
    `ceiling` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `CharacterList_accountId_characterId_key`(`accountId`, `characterId`),
    PRIMARY KEY (`characterListId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CharacterList` ADD CONSTRAINT `CharacterList_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`accountId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CharacterList` ADD CONSTRAINT `CharacterList_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Character`(`characterId`) ON DELETE CASCADE ON UPDATE CASCADE;
