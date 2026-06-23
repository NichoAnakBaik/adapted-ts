"use client";

import React, { useState } from "react";
import { Users, Trash2, Plus, UserPlus, Edit, Key } from "lucide-react";
import { adminCreateUser, adminUpdateUser, deleteUser } from "@/app/actions/admin";

export default function UserManagementPage({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(u => 
    u.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    const res = await deleteUser(id);
    if (res.success) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Yakin ingin mereset password pengguna ini menjadi '123456'?")) return;
    const { resetUserPassword } = await import("@/app/actions/admin");
    const res = await resetUserPassword(id);
    if (res.success) {
      alert(res.message);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
    setError("");
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    let res;
    if (editingUser) {
      formData.append("id", editingUser.id);
      res = await adminUpdateUser(formData);
    } else {
      res = await adminCreateUser(formData);
    }
    
    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      setShowForm(false);
      setEditingUser(null);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-namsan-soft rounded-xl shrink-0">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-namsan-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-namsan-text">Manajemen Pengguna</h1>
            <p className="text-xs md:text-sm text-namsan-text-muted">Kelola akun Siswa, Pengajar, dan Admin.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto bg-namsan-primary hover:bg-namsan-secondary text-namsan-dark font-bold py-2 md:py-2.5 px-4 md:px-5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
        >
          {showForm ? "Batal" : <><UserPlus className="w-4 h-4 md:w-5 md:h-5" /> Tambah Pengguna</>}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">{editingUser ? "Edit Pengguna" : "Buat Pengguna Baru"}</h2>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="text-gray-400 hover:text-red-500 transition-colors p-1 text-2xl leading-none">&times;</button>
            </div>
            {error && <div className="p-3 mb-4 text-xs md:text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
            
            <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" name="nama_lengkap" defaultValue={editingUser?.nama_lengkap || ""} required className="w-full p-2 md:p-2.5 border rounded-lg text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" name="username" defaultValue={editingUser?.username || ""} required className="w-full p-2 md:p-2.5 border rounded-lg text-sm md:text-base" />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                </label>
                <input type="password" name="password" required={!editingUser} className="w-full p-2 md:p-2.5 border rounded-lg text-sm md:text-base" placeholder={editingUser ? "Isi untuk reset password" : ""} />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" defaultValue={editingUser?.role || "SISWA"} required className="w-full p-2 md:p-2.5 border rounded-lg bg-white text-sm md:text-base">
                  <option value="SISWA">Siswa</option>
                  <option value="PENGAJAR">Pengajar</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2 mt-2 md:mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} disabled={isSubmitting} className="w-full sm:w-auto px-4 md:px-5 py-2 md:py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition-colors text-sm md:text-base disabled:opacity-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-namsan-text hover:bg-namsan-text/90 text-white font-bold py-2 md:py-2.5 px-5 md:px-6 rounded-lg transition-colors text-sm md:text-base disabled:opacity-50">
                  {isSubmitting ? "Memproses..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <input 
            type="text" 
            placeholder="Cari nama atau username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:max-w-xs p-2.5 border rounded-lg text-sm bg-white focus:border-namsan-primary outline-none"
          />
        </div>
        <div className="w-full overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] md:text-sm">
                  <th className="p-3 md:p-4 font-bold text-namsan-text-muted whitespace-nowrap">Nama Lengkap</th>
                  <th className="p-3 md:p-4 font-bold text-namsan-text-muted whitespace-nowrap">Username</th>
                  <th className="p-3 md:p-4 font-bold text-namsan-text-muted whitespace-nowrap">Role</th>
                  <th className="p-3 md:p-4 font-bold text-namsan-text-muted text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-xs md:text-base">
                    <td className="p-3 md:p-4 font-medium text-namsan-text whitespace-nowrap">{u.nama_lengkap}</td>
                    <td className="p-3 md:p-4 text-gray-500 whitespace-nowrap">{u.username}</td>
                    <td className="p-3 md:p-4 whitespace-nowrap">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        u.role === 'PENGAJAR' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 md:p-4 text-right whitespace-nowrap flex justify-end gap-1 md:gap-2">
                      <button onClick={() => handleResetPassword(u.id)} className="p-1 md:p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors title='Reset Password (123456)'">
                        <Key className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button onClick={() => handleEditClick(u)} className="p-1 md:p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors title='Edit Pengguna'">
                        <Edit className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1 md:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors title='Hapus Pengguna'">
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 md:p-8 text-center text-xs md:text-sm text-gray-500">Belum ada pengguna.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
