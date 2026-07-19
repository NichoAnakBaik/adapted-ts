const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAudio() {
  const attempt = await prisma.questionAttempt.findMany({
    orderBy: { id: 'desc' },
    take: 1,
    select: { audio_url: true, transcript: true, score: true }
  });
  console.log(attempt);
}

checkAudio().catch(console.error).finally(() => prisma.$disconnect());
