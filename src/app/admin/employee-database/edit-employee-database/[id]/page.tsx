"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import EmployeeForm from "@/components/EmployeeForm";
import { usePageTitle } from "@/context/PageTitleContext";
import { getEmployeeById, updateEmployee } from "@/lib/services/employee";
import { buildEmployeeFormData } from "@/lib/utils/formData";

export default function EditEmployeePage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const params = useParams();
  const rawId = params?.id;
  const id =
    typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle("Employee");

    const fetchData = async () => {
      try {
        if (!id) throw new Error("No ID provided");

        const response = await getEmployeeById(id);

        setInitialData(response.data);
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
        setErrorMessage("Failed to update employee. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (formDataObj: any) => {
    try {
      const data = buildEmployeeFormData(formDataObj);

      for (const pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }

      await updateEmployee(id, data);
      router.push("/admin/employee-database");
    } catch (error) {
      console.error("Failed to update employee:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Edit Employee</h2>
      <EmployeeForm
        mode="edit"
        initialData={initialData}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
