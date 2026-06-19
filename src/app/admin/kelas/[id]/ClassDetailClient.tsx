"use client";

import React, { useState } from "react";
import { ArrowLeft, BookOpen, User, Users, Trash2, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { assignTeacher, enrollStudent, unenrollStudent } from "@/app/actions/admin";

export default function ClassDetailClient({ classData, teachers, allStudents }: { classData: any, teachers: any[], allStudents: any[] }) {
  const [teacherId, setTeacherId] = useState(classData.teacher_id || "");
  const [studentIdToEnroll, setStudentIdToEnroll] = useState("");

  const handleAssignTeacher = async () => {
    const res = await assignTeacher(classData.id, teacherId || null);
    if (res.success) {
      window.location.reload();
    }
  };

  const handleEnrollStudent = async () => {
    if (!studentIdToEnroll) return;
    const res = await enrollStudent(classData.id, studentIdToEnroll);
    if (res.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    if (!confirm("Keluarkan siswa dari kelas ini?")) return;
    const res = await unenrollStudent(enrollmentId);
    if (res.success) {
      window.location.reload();
    }
  };

  // Filter out students who are already enrolled
  const enrolledStudentIds = classData.enrollments.map((e: any) => e.student_id);
  const availableStudents = allStudents.filter(s => !enrolledStudentIds.includes(s.id));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/admin/kelas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-namsan-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-namsan-text mb-2">{classData.name}</h1>
            <div className="flex gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full font-bold ${classData.type === 'ONLINE' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {classData.type}
              </span>
              {classData.schedule && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {classData.schedule}
                </span>
              )}
            </div>
            {classData.meeting_link && (
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-bold">Link Meeting:</span> <a href={classData.meeting_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{classData.meeting_link}</a>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Pengajar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-namsan-text">
              <User className="w-5 h-5 text-namsan-primary" />
              <h2 className="text-lg font-bold">Pengajar Kelas</h2>
            </div>
            
            {classData.teacher ? (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4">
                <p className="font-bold text-namsan-text">{classData.teacher.nama_lengkap}</p>
                <p className="text-sm text-gray-500">@{classData.teacher.username}</p>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4 text-red-600 text-sm">
                Belum ada pengajar yang ditugaskan.
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Ubah Pengajar</label>
              <select 
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full p-2.5 border rounded-lg bg-white text-sm"
              >
                <option value="">-- Kosongkan Pengajar --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
                ))}
              </select>
              <button 
                onClick={handleAssignTeacher}
                disabled={teacherId === (classData.teacher_id || "")}
                className="w-full mt-2 bg-namsan-text hover:bg-namsan-text/90 disabled:opacity-50 disabled:hover:bg-namsan-text text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Simpan Pengajar
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Siswa Enrolled */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-namsan-text">
                <Users className="w-5 h-5 text-namsan-blue" />
                <h2 className="text-lg font-bold">Siswa Terdaftar ({classData.enrollments.length})</h2>
              </div>
            </div>

            {/* Add Student Section */}
            <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <select 
                value={studentIdToEnroll}
                onChange={(e) => setStudentIdToEnroll(e.target.value)}
                className="flex-1 p-2.5 border rounded-lg bg-white text-sm"
              >
                <option value="">-- Pilih Siswa untuk Ditambahkan --</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.nama_lengkap} (@{s.username})</option>
                ))}
              </select>
              <button 
                onClick={handleEnrollStudent}
                disabled={!studentIdToEnroll}
                className="bg-namsan-primary hover:bg-namsan-secondary disabled:opacity-50 text-namsan-dark font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-colors text-sm whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" /> Tambah
              </button>
            </div>

            {/* Enrolled Students List */}
            {classData.enrollments.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {classData.enrollments.map((e: any) => (
                      <tr key={e.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-namsan-text">{e.student.nama_lengkap}</p>
                          <p className="text-xs text-gray-500">@{e.student.username}</p>
                          {e.status === 'PENDING' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full">
                              MENUNGGU PERSETUJUAN
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          {e.status === 'PENDING' && (
                            <button 
                              onClick={async () => {
                                const { updateEnrollmentStatus } = await import("@/app/actions/admin");
                                const res = await updateEnrollmentStatus(e.id, 'APPROVED');
                                if (res.success) window.location.reload();
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                            >
                              Terima
                            </button>
                          )}
                          <button 
                            onClick={() => handleUnenroll(e.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors title='Keluarkan'"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 border border-gray-100 border-dashed rounded-xl">
                <p className="text-gray-500">Belum ada siswa yang didaftarkan di kelas ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
