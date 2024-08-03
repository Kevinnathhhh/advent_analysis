/*
  Warnings:

  - You are about to drop the column `principal_approval` on the `Student_Package` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student_Package" DROP COLUMN "principal_approval";

-- CreateTable
CREATE TABLE "Approval" (
    "approval_id" SERIAL NOT NULL,
    "principal_approval" TEXT NOT NULL DEFAULT 'not yet',
    "headmaster_id" INTEGER NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("approval_id")
);

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_headmaster_id_fkey" FOREIGN KEY ("headmaster_id") REFERENCES "Headmaster"("headmaster_id") ON DELETE RESTRICT ON UPDATE CASCADE;
