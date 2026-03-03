-- DropForeignKey
ALTER TABLE `assignment` DROP FOREIGN KEY `Assignment_evaluationId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluationresult` DROP FOREIGN KEY `EvaluationResult_assignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluationresult` DROP FOREIGN KEY `EvaluationResult_indicatorId_fkey`;

-- DropForeignKey
ALTER TABLE `evidence` DROP FOREIGN KEY `Evidence_indicatorId_fkey`;

-- DropForeignKey
ALTER TABLE `indicator` DROP FOREIGN KEY `Indicator_topicId_fkey`;

-- DropForeignKey
ALTER TABLE `topic` DROP FOREIGN KEY `Topic_evaluationId_fkey`;

-- DropIndex
DROP INDEX `EvaluationResult_assignmentId_fkey` ON `evaluationresult`;

-- DropIndex
DROP INDEX `EvaluationResult_indicatorId_fkey` ON `evaluationresult`;

-- DropIndex
DROP INDEX `Indicator_topicId_fkey` ON `indicator`;

-- DropIndex
DROP INDEX `Topic_evaluationId_fkey` ON `topic`;

-- AlterTable
ALTER TABLE `evaluation` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `creatorId` INTEGER NULL,
    MODIFY `status` ENUM('DRAFT', 'OPEN', 'CLOSED') NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Topic` ADD CONSTRAINT `Topic_evaluationId_fkey` FOREIGN KEY (`evaluationId`) REFERENCES `Evaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Indicator` ADD CONSTRAINT `Indicator_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_evaluationId_fkey` FOREIGN KEY (`evaluationId`) REFERENCES `Evaluation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evidence` ADD CONSTRAINT `Evidence_indicatorId_fkey` FOREIGN KEY (`indicatorId`) REFERENCES `Indicator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationResult` ADD CONSTRAINT `EvaluationResult_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EvaluationResult` ADD CONSTRAINT `EvaluationResult_indicatorId_fkey` FOREIGN KEY (`indicatorId`) REFERENCES `Indicator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
