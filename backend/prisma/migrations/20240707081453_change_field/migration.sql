/*
  Warnings:

  - The primary key for the `Group_Subject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[group_id,subject]` on the table `Group_Subject` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Group_Subject" DROP CONSTRAINT "Group_Subject_pkey",
ADD COLUMN     "groupsubject_id" SERIAL NOT NULL,
ADD CONSTRAINT "Group_Subject_pkey" PRIMARY KEY ("groupsubject_id");

-- CreateIndex
CREATE UNIQUE INDEX "Group_Subject_group_id_subject_key" ON "Group_Subject"("group_id", "subject");
