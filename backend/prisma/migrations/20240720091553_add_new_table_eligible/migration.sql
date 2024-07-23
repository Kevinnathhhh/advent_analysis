/*
  Warnings:

  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Student";

-- CreateTable
CREATE TABLE "Student_Package" (
    "student_package_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nis" INTEGER NOT NULL,
    "fisika" INTEGER NOT NULL,
    "ekonomi" INTEGER NOT NULL,
    "geografi" INTEGER NOT NULL,
    "sosiologi" INTEGER NOT NULL,
    "matematika" INTEGER NOT NULL,
    "informatika" INTEGER NOT NULL,
    "biologi" INTEGER NOT NULL,
    "kimia" INTEGER NOT NULL,
    "recommendation_teacher" TEXT NOT NULL DEFAULT 'none',
    "principal_approval" TEXT NOT NULL DEFAULT 'not yet',

    CONSTRAINT "Student_Package_pkey" PRIMARY KEY ("student_package_id")
);

-- CreateTable
CREATE TABLE "Student_Eligible" (
    "student_eligible_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nis" INTEGER NOT NULL,
    "jurusan" TEXT NOT NULL,
    "nilaisemester1" DOUBLE PRECISION NOT NULL,
    "nilaisemester2" DOUBLE PRECISION NOT NULL,
    "nilaisemester3" DOUBLE PRECISION NOT NULL,
    "nilaisemester4" DOUBLE PRECISION NOT NULL,
    "nilaisemester5" DOUBLE PRECISION NOT NULL,
    "approval" TEXT NOT NULL DEFAULT 'not yet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_Eligible_pkey" PRIMARY KEY ("student_eligible_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_Package_name_key" ON "Student_Package"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_Package_nis_key" ON "Student_Package"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "Student_Eligible_name_key" ON "Student_Eligible"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_Eligible_nis_key" ON "Student_Eligible"("nis");
