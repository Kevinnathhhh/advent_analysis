/*
  Warnings:

  - You are about to drop the column `group_id` on the `Reference_Grade` table. All the data in the column will be lost.
  - Added the required column `groupsubject_id` to the `Reference_Grade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reference_Grade" DROP CONSTRAINT "Reference_Grade_group_id_fkey";

-- DropIndex
DROP INDEX "Group_Subject_group_id_subject_key";

-- AlterTable
ALTER TABLE "Reference_Grade" DROP COLUMN "group_id",
ADD COLUMN     "groupsubject_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Reference_Grade" ADD CONSTRAINT "Reference_Grade_groupsubject_id_fkey" FOREIGN KEY ("groupsubject_id") REFERENCES "Group_Subject"("groupsubject_id") ON DELETE RESTRICT ON UPDATE CASCADE;
