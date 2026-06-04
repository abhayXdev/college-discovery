/*
  Warnings:

  - You are about to drop the column `description` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `fees` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `College` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[instituteId]` on the table `College` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `go` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instituteId` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oi` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `perception` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rpc` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tlr` to the `College` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "College" DROP COLUMN "description",
DROP COLUMN "fees",
DROP COLUMN "rating",
ADD COLUMN     "go" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "instituteId" TEXT NOT NULL,
ADD COLUMN     "oi" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "perception" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rank" INTEGER NOT NULL,
ADD COLUMN     "rpc" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "tlr" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "College_instituteId_key" ON "College"("instituteId");
