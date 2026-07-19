const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  const deleted = await prisma.studentActivityLog.deleteMany({
    where: { metadata: null }
  });
  console.log(`Cleaned ${deleted.count} dummy logs`);
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
