// employee-database->add-employee->database->page.tsx
"use client";

import { usePageTitle } from "@/context/PageTitleContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import axios from "axios"; // axios diimpor melalui api.ts
import EmployeeForm from "@/components/EmployeeForm";
// import api from "@/lib/api"; // Tidak perlu diimpor langsung di sini
import { createEmployee } from "@/lib/services/employee"; // Import fungsi yang sudah disesuaikan
import { buildEmployeeFormData } from "@/lib/utils/formData"; // Fungsi untuk membangun FormData

export default function AddEmployeePage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();

  useEffect(() => {
    setTitle("Tambah Karyawan"); // Ubah judul halaman
  }, [setTitle]);

  const handleAdd = async (formDataObj: any) => {
    try {
      // formDataObj diharapkan sudah berisi data gabungan untuk User dan Employee
      // seperti email, password, FirstName, LastName, EmployeeID, Branch_id, dll.
      // buildEmployeeFormData akan mengubahnya menjadi format yang siap dikirim (misal: FormData atau JSON)
      const dataToSend = buildEmployeeFormData(formDataObj); // Anda mungkin perlu memastikan ini mengembalikan objek biasa, bukan FormData, jika Anda mengirim JSON

      console.log("Mengirim data ke server untuk pembuatan karyawan...");
      // Untuk debugging, jika dataToSend adalah FormData
      if (dataToSend instanceof FormData) {
        for (const pair of dataToSend.entries()) {
          console.log(pair[0], pair[1]);
        }
      } else {
        console.log(dataToSend); // Jika dataToSend adalah objek JSON biasa
      }


      const response = await createEmployee(dataToSend); // Panggil fungsi yang sudah diupdate
      console.log("Respon sukses:", response.data);

      // Tampilkan pesan sukses ke pengguna (opsional, bisa menggunakan toast notification)
      alert("Karyawan berhasil ditambahkan!");

      // Redirect ke halaman daftar karyawan setelah berhasil
      router.push("/admin/employee-database");
    } catch (error: any) {
      console.error("Gagal menambahkan karyawan:", error);

      let errorMessage = "Terjadi kesalahan tak terduga.";

      if (error.response) {
        console.error("Status error:", error.response.status);
        console.error("Data error:", error.response.data);

        // Menangani error validasi dari Laravel (status 422)
        if (error.response.status === 422 && error.response.data.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat().join('\n');
          errorMessage = `Gagal validasi data:\n${validationErrors}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error("Tidak ada respon diterima:", error.request);
        errorMessage = "Tidak ada respon dari server. Periksa koneksi Anda.";
      } else {
        console.error("Pesan error:", error.message);
        errorMessage = error.message;
      }

      // Tampilkan pesan error ke pengguna
      alert(`Gagal menambahkan karyawan:\n${errorMessage}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Tambah Karyawan Baru</h2>
      {/* EmployeeForm harus menyediakan semua input yang diperlukan untuk User dan Employee */}
      <EmployeeForm mode="add" onSubmit={handleAdd} />
    </div>
  );
}