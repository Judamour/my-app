-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "showAvatar" BOOLEAN NOT NULL DEFAULT true;
