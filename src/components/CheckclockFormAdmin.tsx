"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRouter } from "next/navigation";
import { FiCalendar } from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import dynamic from "next/dynamic";
import axios from "axios";

interface Employee {
  id: number;
  FirstName: string;
  LastName: string;
  Position: string;
}

interface FormInitialData {
  id?: number;
  employee: string;
  type: string;
  date?: string;
  time?: string;
  note?: string;
  startDate?: string;
  endDate?: string;
  location: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  proof?: File | string | null;
}

interface FormData extends Omit<FormInitialData, "proof"> {
  proof?: File | null;
}

interface CheckclockFormProps {
  mode: "add" | "edit";
  initialData?: FormInitialData;
  onSubmit: (formData: FormInitialData) => Promise<void>;
}

export default function CheckclockFormAdmin({
  mode,
  initialData,
  onSubmit,
}: CheckclockFormProps) {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<FormInitialData>({
    employee: initialData?.employee || "",
    type: initialData?.type || "",
    date: initialData?.date || new Date().toISOString().split("T")[0], // tambah ini
    time: initialData?.time || new Date().toTimeString().split(" ")[0], // tambah ini
    note: initialData?.note || "", // tambah ini
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    location:
      initialData?.location ||
      "Office",
    detailAddress: initialData?.detailAddress || "",
    latitude: initialData?.latitude || -7.983908,
    longitude: initialData?.longitude || 112.621381,
    proof: initialData?.proof || null,
  });

  // Dynamic Map import
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>Loading map...</p>,
        ssr: false,
      }),
    []
  );

  useEffect(() => {
    setTitle(mode === "add" ? "Add Checkclock" : "Edit Checkclock");
  }, [setTitle, mode]);

  // Get location and address
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromCoordinates(latitude, longitude);

          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            detailAddress: address,
          }));
        },
        error => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, proof: file }));
      setFileName(file.name);
      setProofUploaded(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData(prev => ({ ...prev, proof: file }));
      setFileName(file.name);
      setProofUploaded(true);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.employee) {
      alert("Please select an employee");
      return false;
    }
    if (!formData.type) {
      alert("Please select attendance type");
      return false;
    }
    if (
      (formData.type === "annual-leave" || formData.type === "sick-leave") &&
      (!formData.startDate || !formData.endDate)
    ) {
      alert("Please select both start and end dates");
      return false;
    }
    // For check-in/check-out, validate time
    if (
        (formData.type === "check-in" || formData.type === "check-out") &&
        !formData.time
    ) {
        alert("Please select time for check-in/check-out");
        return false;
    }
    
    if (!formData.location || formData.location.trim() === "") {
        setError("Location is required");
        return false;
    }

    return true;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  setError("");

  try {
    const formPayload = new FormData();

    // Isi data umum
    formPayload.append("employee_id", formData.employee);
    formPayload.append("check_clock_type", formData.type);

    // Tanggal
    const currentDate =
      formData.date || new Date().toISOString().split("T")[0];
      formPayload.append("check_clock_date", currentDate);

    // Time handling - only for check-in/check-out
    if (formData.type === "check-in" || formData.type === "check-out") {
      let currentTime =
        formData.time || new Date().toTimeString().split(" ")[0];

      // Tambahkan detik jika tidak ada (jika formatnya masih HH:mm)
      if (/^\d{2}:\d{2}$/.test(currentTime)) {
        currentTime += ":00";
      }

      formPayload.append("check_clock_time", currentTime);
    }

    // ✅ Tambahan: Waktu default jika type = annual-leave / sick-leave
    if (formData.type === "annual-leave" || formData.type === "sick-leave") {
      const now = new Date();
      const currentTime = '00:00:00'; // Format: HH:mm:ss
      formPayload.append("check_clock_time", currentTime);
      formPayload.append("check_out_time", currentTime);

      formPayload.append('update_type', formData.type);
    }

    formPayload.append("note", formData.note || "");

    // Untuk cuti / izin
    if (formData.type === "annual-leave" || formData.type === "sick-leave") {
      if (!formData.startDate || !formData.endDate) {
        throw new Error(
          "Start and end dates are required for leave requests"
        );
      }
      formPayload.append("start_date", formData.startDate);
      formPayload.append("end_date", formData.endDate);
    }

    // Lokasi & bukti - dikirim sebagai string kosong jika tidak tersedia
    formPayload.append("location", formData.location || "");
    formPayload.append("address", formData.detailAddress || "");
    formPayload.append("latitude", formData.latitude?.toString() || "");
    formPayload.append("longitude", formData.longitude?.toString() || "");

    if (formData.proof instanceof File) {
      formPayload.append("photo", formData.proof);
    }

    console.log("Form Payload:", formPayload);

    const url =
      mode === "edit"
        ? `http://localhost:8000/api/checkclocks/${initialData?.id}`
        : "http://localhost:8000/api/checkclocks";

    const method = "post"; // GUNAKAN POST SELALU

    // Tambahkan _method=PUT jika edit
    if (mode === "edit") {
      formPayload.append("_method", "PUT");
    }

    const response = await axios.post(url, formPayload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

   if (response.status === (mode === "edit" ? 200 : 201)) {
      router.push("/admin/checkclock");
    } else {
      throw new Error(
        // response.data.message || `Failed to ${mode} attendance`
      );
    }

  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while submitting";
      setError(errorMessage);
      // console.error("Submission error:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const fetchEmployees = async () => {
    // console.log("fetchEmployees dipanggil!");

    try {
      const response = await fetch("http://localhost:8000/api/employee");
      const data = await response.json();
      // console.log("Data dari API:", data);
      setEmployees(data);
    } catch (error) {
      console.error("Gagal fetch:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* ========= FORM CHECKCLOCK ========= */}
        {/* Employee */}
        <div>
          <label className="block mb-1 font-medium">Employee</label>
          <select
            value={formData.employee}
            onChange={e =>
              setFormData(prev => ({ ...prev, employee: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled hidden>
              Choose Employee
            </option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {`${employee.FirstName} ${employee.LastName} - ${employee.Position}`}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <div className="flex items-center border rounded px-3 py-2">
            <FiCalendar className="mr-2 text-xl" />
            <input
              type="date"
              value={formData.date}
              onChange={e =>
                setFormData(prev => ({ ...prev, date: e.target.value }))
              }
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* Type of Attendance */}
        <div>
          <label className="block mb-1 font-medium">Type of Attendance</label>
          <select
            value={formData.type}
            onChange={e =>
              setFormData(prev => ({ ...prev, type: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled hidden>
              Choose Type of Attendance
            </option>
            <option value="check-in">Clock In</option>
            <option value="check-out">Clock Out</option>
            <option value="annual-leave">Annual Leave</option>
            <option value="sick-leave">Sick Leave</option>
          </select>
        </div>

        {/* Show only if Annual or Sick Leave */}
        {(formData.type === "annual-leave" ||
          formData.type === "sick-leave") && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Start Date</label>
              <div className="flex items-center border rounded px-3 py-2">
                <FiCalendar className="mr-2 text-xl" />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">End Date</label>
              <div className="flex items-center border rounded px-3 py-2">
                <FiCalendar className="mr-2 text-xl" />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Time : nambah ini*/}
        {(formData.type === "check-in" || formData.type === "check-out") && (
        <div>
            <label className="block mb-1 font-medium">Time</label>
            <div className="flex items-center border rounded px-3 py-2">
            <FiClock className="mr-2 text-xl" />
            <input
                type="time"
                value={formData.time}
                onChange={e =>
                setFormData(prev => ({ ...prev, time: e.target.value }))
                }
                className="w-full outline-none"
            />
            </div>
        </div>
        )}

        {/* Note */}
        <div>
          <label className="block mb-1 font-medium">Note</label>
          <textarea
            value={formData.note}
            onChange={e =>
              setFormData(prev => ({ ...prev, note: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* ========= BUTTONS ========= */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/checkclock")}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
