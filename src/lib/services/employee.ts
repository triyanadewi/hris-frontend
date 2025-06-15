// lib/services/employee.ts
import api from '../api';

// Mendapatkan daftar semua karyawan
// Catatan: Ini mungkin hanya boleh diakses oleh admin atau role tertentu
export const getEmployees = () => {
  // Disarankan menambahkan token admin/user dan otorisasi di backend
  const token = localStorage.getItem('admin_auth_token') || localStorage.getItem('employee_auth_token'); // Ambil token yang relevan
  return api.get('/user/employees', { // Sesuaikan endpoint sesuai routes/api.php
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Mendapatkan detail satu karyawan berdasarkan ID
// Catatan: Karyawan mungkin hanya bisa melihat profilnya sendiri, admin bisa melihat semua
export const getEmployee = (id: number) => {
  const token = localStorage.getItem('admin_auth_token') || localStorage.getItem('employee_auth_token');
  return api.get(`/user/employees/${id}`, { // Sesuaikan endpoint sesuai routes/api.php
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Alias untuk getEmployee, mempertahankan kompatibilitas jika ada yang memanggilnya dengan nama ini
export const getEmployeeById = (id: string | number) => {
  return getEmployee(Number(id)); // Memastikan ID adalah number
};

// Membuat karyawan baru (HANYA UNTUK ADMIN)
// Mengirim data ke endpoint '/admin/employees'
export const createEmployee = (data: any) => { // Ubah type data jika Anda mengirim JSON
  const adminToken = localStorage.getItem('admin_auth_token');
  if (!adminToken) {
    throw new Error('Admin token tidak ditemukan. Mohon login sebagai admin.');
  }

  // Jika Anda mengirim FormData (misalnya untuk upload file foto), biarkan Content-Type diatur otomatis oleh browser
  // Jika Anda mengirim objek JSON biasa, pastikan headers diatur ke 'application/json'
  return api.post("/admin/employees", data, { // Endpoint yang benar untuk admin membuat karyawan
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      // 'Content-Type': 'application/json', // Hanya jika 'data' adalah objek JSON biasa
    },
  });
};

// Memperbarui data karyawan
// Catatan: Ini bisa diakses oleh karyawan untuk profilnya sendiri atau admin untuk karyawan lain
export const updateEmployee = (id: string | number, data: FormData) => {
  const token = localStorage.getItem('admin_auth_token') || localStorage.getItem('employee_auth_token');
  if (!token) {
    throw new Error('Token otentikasi tidak ditemukan.');
  }

  // Laravel menggunakan POST untuk PUT/PATCH dengan _method field saat menggunakan FormData
  data.append("_method", "PUT");
  return api.post(`/user/employees/${id}`, data, { // Sesuaikan endpoint sesuai routes/api.php
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Menghapus karyawan (HANYA UNTUK ADMIN)
export const deleteEmployee = async (id: number) => {
  const adminToken = localStorage.getItem('admin_auth_token');
  if (!adminToken) {
    throw new Error('Admin token tidak ditemukan. Mohon login sebagai admin.');
  }
  return await api.delete(`/user/employees/${id}`, { // Sesuaikan endpoint sesuai routes/api.php
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
};

// Menghapus achievement karyawan
export const removeAchievement = async (id: number) => {
  const token = localStorage.getItem('admin_auth_token') || localStorage.getItem('employee_auth_token'); // Asumsi bisa admin atau karyawan (untuk achievement sendiri)
  if (!token) {
    throw new Error('Token otentikasi tidak ditemukan.');
  }
  return await api.delete(`/user/employees/achievements/${id}`, { // Sesuaikan endpoint sesuai routes/api.php
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
};

