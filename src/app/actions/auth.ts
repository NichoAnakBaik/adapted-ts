'use server';

import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (user && bcrypt.compareSync(password, user.password)) {
    // Session payload mirroring what was in Flask
    const payload = {
      user_id: user.id,
      username: user.username,
      nama: user.nama_lengkap,
      role: user.role,
    };
    
    await createSession(payload);

    // LOGIKA ABSENSI (Hanya untuk Siswa)
    if (user.role === 'siswa') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day

      const existingAbsen = await prisma.absensiLogbook.findFirst({
        where: {
          id_siswa: user.id,
          tanggal: today,
          waktu_keluar: null,
        },
      });

      if (!existingAbsen) {
        await prisma.absensiLogbook.create({
          data: {
            id_siswa: user.id,
            waktu_masuk: new Date(),
            tanggal: today,
          },
        });
      }
    }

    if (user.role === 'admin') redirect('/admin/dashboard');
    if (user.role === 'pengajar') redirect('/pengajar/dashboard');
    redirect('/siswa/dashboard');
  }

  return { error: 'Username atau password salah.' };
}

export async function signup(formData: FormData) {
  const nama_lengkap = formData.get('nama_lengkap') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string || 'siswa';

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        nama_lengkap,
        username,
        password: hashedPassword,
        role,
      },
    });
    
    redirect('/login');
  } catch (error) {
    return { error: 'Username sudah digunakan.' };
  }
}

export async function logout(userId: number, role: string) {
  // UPDATE LOG ABSENSI (Logout)
  if (role === 'siswa') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const absenHariIni = await prisma.absensiLogbook.findFirst({
      where: {
        id_siswa: userId,
        tanggal: today,
        waktu_keluar: null,
      },
    });

    if (absenHariIni && absenHariIni.waktu_masuk) {
      const waktuKeluar = new Date();
      const durasiMenit = Math.floor(
        (waktuKeluar.getTime() - absenHariIni.waktu_masuk.getTime()) / 60000
      );

      await prisma.absensiLogbook.update({
        where: { id_absen: absenHariIni.id_absen },
        data: {
          waktu_keluar: waktuKeluar,
          durasi_menit: durasiMenit,
        },
      });
    }
  }

  await deleteSession();
  redirect('/');
}
