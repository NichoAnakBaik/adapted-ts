const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    const password = await bcrypt.hash('password123', 10);
    const newAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        nama_lengkap: 'Administrator',
        password,
        role: 'ADMIN'
      }
    });
    console.log('Created dummy admin:', newAdmin.username);
  } else {
    console.log('Admin already exists:', admin.username);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
