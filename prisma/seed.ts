import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing users just to be safe during initial setup
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // Seed Admin
  const admin = await prisma.user.create({
    data: {
      nama_lengkap: 'Super Admin',
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  })
  console.log('Admin created:', admin.username)

  // Seed Pengajar
  const pengajar = await prisma.user.create({
    data: {
      nama_lengkap: 'Budi (Pengajar)',
      username: 'pengajar',
      password: passwordHash,
      role: 'PENGAJAR',
    },
  })
  console.log('Pengajar created:', pengajar.username)

  // Seed Siswa
  const siswa = await prisma.user.create({
    data: {
      nama_lengkap: 'Ani (Siswa)',
      username: 'siswa',
      password: passwordHash,
      role: 'SISWA',
    },
  })
  console.log('Siswa created:', siswa.username)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
