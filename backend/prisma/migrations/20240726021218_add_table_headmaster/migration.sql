-- CreateTable
CREATE TABLE "Headmaster" (
    "headmaster_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Headmaster_pkey" PRIMARY KEY ("headmaster_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Headmaster_username_key" ON "Headmaster"("username");
