-- CreateTable
CREATE TABLE "Admin" (
    "admin_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "student_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nis" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "grade_id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "student_id" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("grade_id")
);

-- CreateTable
CREATE TABLE "Reference_Grade" (
    "referencegrade_id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" DOUBLE PRECISION NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "Reference_Grade_pkey" PRIMARY KEY ("referencegrade_id")
);

-- CreateTable
CREATE TABLE "Group" (
    "group_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "Group_Subject" (
    "group_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,

    CONSTRAINT "Group_Subject_pkey" PRIMARY KEY ("group_id","subject")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Student_name_key" ON "Student"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_nis_key" ON "Student"("nis");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference_Grade" ADD CONSTRAINT "Reference_Grade_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group_Subject" ADD CONSTRAINT "Group_Subject_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;
