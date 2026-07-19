const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.questionAttempt.updateMany({
    where: { transcript: '[Sedang diproses oleh AI...]' },
    data: {
      transcript: '[Transkripsi gagal]',
      ai_feedback: 'AI Error: Gagal memproses transkripsi suara (Sistem sibuk atau gagal terhubung ke AI).'
    }
  });
  const failedAttempts = await prisma.questionAttempt.findMany({
    where: { ai_feedback: { contains: 'models/gemini-pro is not found' } }
  });
  for (const fa of failedAttempts) {
    await prisma.questionAttempt.update({
      where: { id: fa.id },
      data: {
        ai_feedback: 'Gagal terhubung ke model analisis AI: Model API error. Evaluasi telah diperbarui ke sistem baru, silakan coba lagi.'
      }
    });
  }
  console.log('Fixed stuck DB entries');
}
main().finally(() => prisma.$disconnect());
