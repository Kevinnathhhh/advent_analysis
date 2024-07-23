/*
  Warnings:

  - You are about to drop the column `nis` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Group_Subject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reference_Grade` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `biologi` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ekonomi` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fisika` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `geografi` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `informatika` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kimia` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matematika` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sosiologi` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Group_Subject" DROP CONSTRAINT "Group_Subject_group_id_fkey";

-- DropForeignKey
ALTER TABLE "Reference_Grade" DROP CONSTRAINT "Reference_Grade_groupsubject_id_fkey";

-- DropIndex
DROP INDEX "Student_name_key";

-- DropIndex
DROP INDEX "Student_nis_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "nis",
ADD COLUMN     "biologi" INTEGER NOT NULL,
ADD COLUMN     "ekonomi" INTEGER NOT NULL,
ADD COLUMN     "fisika" INTEGER NOT NULL,
ADD COLUMN     "geografi" INTEGER NOT NULL,
ADD COLUMN     "informatika" INTEGER NOT NULL,
ADD COLUMN     "kimia" INTEGER NOT NULL,
ADD COLUMN     "matematika" INTEGER NOT NULL,
ADD COLUMN     "sosiologi" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "Group_Subject";

-- DropTable
DROP TABLE "Reference_Grade";

-- CreateTable
CREATE TABLE "Recommendation" (
    "recommendation_id" SERIAL NOT NULL,
    "group" INTEGER NOT NULL,
    "group_grade" TEXT NOT NULL,
    "group_recommendation" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("recommendation_id")
);

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;
