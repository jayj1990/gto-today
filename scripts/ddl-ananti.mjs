// 아난티 선점 테이블 수동 DDL — 이 레포는 migrations 없음, db push 금지.
// 실행: node --env-file=apps/web/.env.local scripts/ddl-ananti.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const stmts = [
  `CREATE TABLE IF NOT EXISTS "AnantiRequest" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "stayDate" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "folio" TEXT,
    "amount" INTEGER,
    "lastError" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastTryAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnantiRequest_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AnantiRequest_platform_roomName_stayDate_key"
     ON "AnantiRequest"("platform", "roomName", "stayDate")`,
  `CREATE INDEX IF NOT EXISTS "AnantiRequest_status_stayDate_idx"
     ON "AnantiRequest"("status", "stayDate")`,
  `CREATE TABLE IF NOT EXISTS "AnantiConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "sweepEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sweepPlatform" TEXT NOT NULL DEFAULT 'chord',
    "sweepRoom" TEXT NOT NULL DEFAULT '더 하우스 확장 (킹2+트윈)',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnantiConfig_pkey" PRIMARY KEY ("id")
  )`,
  `INSERT INTO "AnantiConfig" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING`,
];

for (const sql of stmts) {
  await prisma.$executeRawUnsafe(sql);
  console.log('ok:', sql.slice(0, 60).replace(/\s+/g, ' '));
}
await prisma.$disconnect();
