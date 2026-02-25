-- AlterEnum
ALTER TYPE "GatewayProvider" ADD VALUE 'EFIPAY';

-- AlterTable
ALTER TABLE "PaymentGateway" ADD COLUMN "automaticWithdrawal" BOOLEAN NOT NULL DEFAULT true;
