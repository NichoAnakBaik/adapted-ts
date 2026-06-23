import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data...');

  // 1. Create or ensure we have Pengajar
  let teacher = await prisma.user.findFirst({ where: { role: 'PENGAJAR' } });
  if (!teacher) {
    const password = await bcrypt.hash('password123', 10);
    teacher = await prisma.user.create({
      data: {
        username: 'pengajar_dummy',
        nama_lengkap: 'Dr. Kim Seok-jin',
        password,
        role: 'PENGAJAR'
      }
    });
    console.log('Created dummy teacher:', teacher.nama_lengkap);
  }

  // 2. Create or ensure we have some Siswa
  const students = [];
  for (let i = 1; i <= 3; i++) {
    let student = await prisma.user.findUnique({ where: { username: `siswa_dummy_${i}` } });
    if (!student) {
      const password = await bcrypt.hash('password123', 10);
      student = await prisma.user.create({
        data: {
          username: `siswa_dummy_${i}`,
          nama_lengkap: `Siswa Dummy ${i}`,
          password,
          role: 'SISWA'
        }
      });
      console.log('Created dummy student:', student.nama_lengkap);
    }
    students.push(student);
  }

  // Find existing real students to include in the dummy data if they exist
  const allStudents = await prisma.user.findMany({ where: { role: 'SISWA' } });

  // 3. Create Classes
  const classA = await prisma.class.upsert({
    where: { id: 'dummy-class-a' },
    update: {},
    create: {
      id: 'dummy-class-a',
      name: 'Bahasa Korea Dasar (Hangeul)',
      type: 'ONLINE',
      teacher_id: teacher.id,
      module_link: 'https://drive.google.com/drive/folders/dummy-a'
    }
  });

  const classB = await prisma.class.upsert({
    where: { id: 'dummy-class-b' },
    update: {},
    create: {
      id: 'dummy-class-b',
      name: 'Bahasa Korea Menengah (Percakapan)',
      type: 'OFFLINE',
      teacher_id: teacher.id,
      module_link: 'https://drive.google.com/drive/folders/dummy-b'
    }
  });
  console.log('Created dummy classes.');

  // 4. Enroll all students to Class A
  for (const s of allStudents) {
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { class_id: classA.id, student_id: s.id }
    });
    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: { class_id: classA.id, student_id: s.id }
      });
    }
  }

  // 6. Create Exams (1 Kuis, 1 Ujian Akhir)
  const examKuis = await prisma.exam.upsert({
    where: { id: 'dummy-kuis-1' },
    update: {},
    create: {
      id: 'dummy-kuis-1',
      title: 'Kuis Evaluasi Hangeul',
      description: 'Uji kemampuan membaca Hangeul Anda.',
      is_final: false,
      is_published: true,
      time_limit: 30,
      class_id: classA.id
    }
  });

  const examUjian = await prisma.exam.upsert({
    where: { id: 'dummy-ujian-1' },
    update: {},
    create: {
      id: 'dummy-ujian-1',
      title: 'Ujian Akhir Tingkat Dasar',
      description: 'Ujian akhir mencakup Reading, Listening, dan Speaking.',
      is_final: true,
      is_published: true,
      time_limit: 60,
      class_id: classA.id
    }
  });

  // Questions for Kuis
  await prisma.question.upsert({
    where: { id: 'dummy-q-1' },
    update: {},
    create: {
      id: 'dummy-q-1',
      exam_id: examKuis.id,
      question_text: 'Apa bacaan dari kata "안녕하세요"?',
      type: 'READING',
      format: 'MULTIPLE_CHOICE',
      option_a: 'Annyeonghaseyo',
      option_b: 'Kamsahamnida',
      option_c: 'Saranghae',
      option_d: 'Mianhae',
      answer_key: 'A',
      difficulty: 1
    }
  });

  // Questions for Ujian (Mixed types)
  await prisma.question.upsert({
    where: { id: 'dummy-q-2' },
    update: {},
    create: {
      id: 'dummy-q-2',
      exam_id: examUjian.id,
      question_text: 'Dengarkan percakapan berikut, di mana mereka berada?',
      type: 'LISTENING',
      format: 'MULTIPLE_CHOICE',
      option_a: 'Sekolah',
      option_b: 'Rumah Sakit',
      option_c: 'Restoran',
      option_d: 'Pasar',
      answer_key: 'C',
      difficulty: 2
    }
  });

  await prisma.question.upsert({
    where: { id: 'dummy-q-3' },
    update: {},
    create: {
      id: 'dummy-q-3',
      exam_id: examUjian.id,
      question_text: 'Tolong baca kalimat berikut dengan lantang: "저는 학생입니다." (Saya adalah siswa).',
      type: 'SPEAKING',
      format: 'ESSAY',
      difficulty: 3
    }
  });

  // 7. Generate ML Activity Logs (to make charts look good)
  // We'll generate random activities over the past 7 days for all students
  const activityTypes = ['LOGIN', 'MODULE_ACCESS', 'EXAM_ATTEMPT', 'FORUM_PARTICIPATION'];
  const now = new Date();
  
  for (const s of allStudents) {
    const existingLogs = await prisma.studentActivityLog.count({ where: { student_id: s.id } });
    if (existingLogs < 10) {
      for (let i = 0; i < 20; i++) {
        // Random date within last 7 days
        const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
        // Random duration between 5 to 60 mins (300 to 3600 seconds)
        const duration = Math.floor(Math.random() * 3300) + 300;
        
        await prisma.studentActivityLog.create({
          data: {
            student_id: s.id,
            action_type: activityTypes[Math.floor(Math.random() * activityTypes.length)] as any,
            duration: duration,
            created_at: randomDate
          }
        });
      }
    }

    // Generate Attendances
    const existingAtt = await prisma.attendance.count({ where: { student_id: s.id } });
    if (existingAtt === 0) {
      await prisma.attendance.create({
        data: { class_id: classA.id, student_id: s.id, status: 'PRESENT', date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }
      });
      await prisma.attendance.create({
        data: { class_id: classA.id, student_id: s.id, status: 'LATE', date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) }
      });
    }

    // Generate Recommendations
    const existingRec = await prisma.recommendationHistory.count({ where: { student_id: s.id } });
    if (existingRec === 0) {
      await prisma.recommendationHistory.create({
        data: {
          student_id: s.id,
          recommendation_type: 'MODULE_SUGGESTION',
          recommendation_text: 'Tingkatkan latihan Speaking. Nilai pelafalan (pronunciation) Anda cenderung lebih rendah pada sesi pagi.',
          is_applied: false
        }
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
