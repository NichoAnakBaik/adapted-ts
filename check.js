const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { username: 'namsan_siswa' } });
  console.log(user);
}

check().catch(console.error).finally(() => prisma.$disconnect());
