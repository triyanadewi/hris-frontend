"use client";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import LetterForm from "@/components/LetterFormUser";
import api from "@/lib/api";

export default function LetterUserPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Letter Managament");
  }, [setTitle]);

  const handleAdd = async (formDataRaw: any) => {
    try {
      const formData = new FormData();

      // WAJIB: sesuaikan dengan isi form-mu
      formData.append("letter_format_id", formDataRaw.letterFormatId); 
      formData.append("user_id", formDataRaw.userId); 

      // Append field berdasarkan jenis surat
      switch (formDataRaw.letterFormatId) {
        case "1": // resignation
          formData.append("resignation_date", formDataRaw.date);
          formData.append("reason_resign", formDataRaw.reason);
          formData.append(
            "additional_notes",
            formDataRaw.additionalNotes || ""
          );
          break;

        case "2": // transfer
          formData.append("current_division", formDataRaw.currentDivision);
          formData.append("requested_division", formDataRaw.desiredDivision);
          formData.append("reason_transfer", formDataRaw.reason);
          break;

        case "3": // payroll
          formData.append("current_salary", formDataRaw.currentSalary);
          formData.append("requested_salary", formDataRaw.desiredSalary);
          formData.append("reason_salary", formDataRaw.reason);
          break;

        case "4": // permission
          formData.append("leave_start", formDataRaw.leaveStartDate);
          formData.append("return_to_work", formDataRaw.returnToWorkDate);
          formData.append("reason_for_leave", formDataRaw.reason);
          break;
      }

      // Opsional, default false
      formData.append("is_sent", "true");
      formData.append("is_approval", "false");

      const res = await api.post("/letters", formData);

      console.log("Surat berhasil dikirim:", res.data);
      alert("Surat berhasil dibuat!");
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.error("Validation failed:", error.response.data.errors);
        alert("Validasi gagal. Periksa input form.");
      } else {
        console.error("Unexpected error:", error);
        alert("Terjadi kesalahan saat membuat surat.");
      }
    }
  };

  return <LetterForm mode="add" onSubmit={handleAdd} />;
}
