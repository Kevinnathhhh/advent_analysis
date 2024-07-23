-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "principal_approval" TEXT NOT NULL DEFAULT 'belum disetujui',
ADD COLUMN     "recommendation_teacher" TEXT NOT NULL DEFAULT 'none';
