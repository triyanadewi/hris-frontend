"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { usePageTitle } from "@/context/PageTitleContext";
import CheckclockFormAdmin from "@/components/CheckclockFormAdmin";

interface ApiResponse {
  status: number;
  message: string;
  data: ApiData;
}

interface ApiData {
  id: number;
  employee_id: number;
  employee_name: string;
  check_clock_type: string;
  check_clock_time: string;
  check_clock_date: string;
  location: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  photo: string | null;
}

interface FormInitialDataEdit {
  id?: number;
  employee: string;
  type: string;
  startDate?: string;
  endDate?: string;
  location: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  proof?: File | string | null;
}

export default function EditCheckclock() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [initialData, setInitialData] = useState<FormInitialDataEdit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle("Edit Checkclock");
    fetchCheckclockData();
  }, [id, setTitle]);

  const fetchCheckclockData = async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `http://localhost:8000/api/checkclocks/${id}`
      );

      if (response.data.status === 200) {
        console.log("Fetched data:", response.data.data);
        const data = response.data.data;

        // Transform API data to match form structure
        const transformedData: FormInitialDataEdit = {
          id: data.id,
          employee: data.employee_id?.toString() || "",
          type: data.check_clock_type || "check-in" || "check-out" || "Annual Leave" || "Sick Leave",
          startDate: data.check_clock_date || undefined,
          endDate: undefined,
          location: data.location || "",
          detailAddress: data.address || "",
          latitude: data.latitude ? parseFloat(data.latitude) : -7.983908,
          longitude: data.longitude ? parseFloat(data.longitude) : 112.621381,
          proof: data.photo,
        };

        setInitialData(transformedData);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch checkclock data"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch checkclock data";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleFormSubmit function
  const handleFormSubmit = async (formData: FormInitialDataEdit) => {
    try {
      const formPayload = new FormData();

      // Append form data with correct type checking
      formPayload.append("employee_id", formData.employee);
      formPayload.append("check_clock_type", formData.type);

      // Handle dates
      if (formData.type === "Annual Leave" || formData.type === "Sick Leave") {
        if (formData.startDate)
          formPayload.append("start_date", formData.startDate);
        if (formData.endDate) formPayload.append("end_date", formData.endDate);
      } else {
        if (formData.startDate)
          formPayload.append("check_clock_date", formData.startDate);
      }

      // Handle location data
      if (formData.location) formPayload.append("location", formData.location);
      if (formData.detailAddress)
        formPayload.append("address", formData.detailAddress);

      // Handle coordinates
      if (typeof formData.latitude === "number") {
        formPayload.append("latitude", formData.latitude.toString());
      }
      if (typeof formData.longitude === "number") {
        formPayload.append("longitude", formData.longitude.toString());
      }

      // Handle file upload if exists
      if (formData.proof instanceof File) {
        formPayload.append("photo", formData.proof);
      }

      const response = await axios.put<ApiResponse>(
        `http://localhost:8000/api/checkclocks/${id}`,
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === 200) {
        router.push("/admin/checkclock");
      } else {
        throw new Error(response.data.message || "Failed to update checkclock");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update checkclock";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return (
      <div className="p-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push("/admin/checkclock")}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Back to List
        </button>
      </div>
    );
  if (!initialData) return <div className="p-4">No data found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Edit Check Clock Record</h2>
      <CheckclockFormAdmin
        mode="edit"
        initialData={initialData}
        onSubmit={handleFormSubmit}
      />++=
    </div>
  );
}
