const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function testLog() {
  await prisma.studentActivityLog.create({
    data: {
      student_id: '72c2a0e3-b6ed-48d8-ab9c-4f2b26a3d50c', // id for namsan_siswa
      action_type: 'LOGIN',
      metadata: JSON.stringify({ targetName: 'Sistem AdaptEd' })
    }
  });
  console.log("Success");
}
testLog().catch(console.error).finally(() => prisma.$disconnect());
