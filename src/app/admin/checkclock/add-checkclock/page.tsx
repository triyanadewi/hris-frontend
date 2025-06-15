'use client';
import React, { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRouter } from "next/navigation";
import { FiCalendar } from "react-icons/fi";
import CheckclockForm from "@/components/CheckclockFormAdmin";

export default function AddCheckclock() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleUpload = async (formData: any) => {
    // You may want to use formData here, depending on your form implementation
    if (!selectedFile) return;
    const uploadData = new FormData();
    uploadData.append("proof", selectedFile);
    console.log("File uploaded:", selectedFile);

    // Simulasi kirim ke backend:
    alert("File uploaded: " + selectedFile.name);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Add Employee</h2>
    <CheckclockForm mode="add" onSubmit={handleUpload} />
    </div>
  );
}
