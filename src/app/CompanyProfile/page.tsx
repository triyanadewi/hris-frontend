"use client";

import { useState } from "react";
import { createCompany } from "@/lib/services/company";
import { useRouter } from "next/navigation";

export default function CompanyProfileForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    head_office_phone: "",
    head_office_phone_backup: "",
    head_office_address: "",
    description: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const steps = ["Company Profile", "Package", "Checkout", "Company Detail"];
  const currentStep = 1;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.name) newErrors.name = "Company name is required.";

    if (!formData.head_office_address)
      newErrors.head_office_address = "Address is required.";

    if (!formData.head_office_phone) {
      newErrors.head_office_phone = "Phone number is required.";
    } else if (!/^\d{12}$/.test(formData.head_office_phone)) {
      newErrors.head_office_phone = "Phone number must be exactly 12 digits.";
    }

    if (
      formData.head_office_phone_backup &&
      !/^\d{12}$/.test(formData.head_office_phone_backup)
    ) {
      newErrors.head_office_phone_backup =
        "Backup phone number must be 12 digits.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setErrors({});

    try {
      await createCompany(formData);
      alert("Company profile saved successfully!");
      router.push("/package-plans");
    } catch (error: any) {
      if (error.errors) {
        setErrors(error.errors);
      } else {
        console.error("Submission error:", error);
      }
    }
  };

  return (
    <div className="bg-[#e8f1fb] min-h-screen py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Company Profile
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Help us get started by providing your company’s basic information.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-center items-center space-x-8 mb-12">
        {["Company Profile", "Package", "Checkout", "Company Detail"].map(
          (label, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-200 ${
                    index === 0
                      ? "bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-lg"
                      : "bg-white text-[#1E3A5F] border-[#1E3A5F]"
                  }`}>
                  {index + 1}
                </div>
                <span className="text-sm mt-2 text-gray-600 w-24 text-center font-medium">
                  {label}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-1 mx-4 rounded-full ${
                    index === 0 ? "bg-[#1E3A5F]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          )
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Company Profile</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block mb-1 font-medium">Company Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter the name of your company"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Company Address */}
            <div>
              <label className="block mb-1 font-medium">Company Address</label>
              <input
                name="head_office_address"
                value={formData.head_office_address}
                onChange={handleChange}
                placeholder="Enter the full address of your company"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.head_office_address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.head_office_address}
                </p>
              )}
            </div>

            {/* Company Description */}
            <div>
              <label className="block mb-1 font-medium">
                Company Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe your company"
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-28"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                name="head_office_phone"
                value={formData.head_office_phone}
                onChange={handleChange}
                placeholder="Enter the primary phone number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.head_office_phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.head_office_phone}
                </p>
              )}
            </div>

            {/* Alternate Phone Number */}
            <div>
              <label className="block mb-1 font-medium">
                Alternate Phone Number
              </label>
              <input
                name="head_office_phone_backup"
                value={formData.head_office_phone_backup}
                onChange={handleChange}
                placeholder="Enter a backup contact number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.head_office_phone_backup && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.head_office_phone_backup}
                </p>
              )}
            </div>

            {/* Company Email */}
            <div>
              <label className="block mb-1 font-medium">Company Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter the official company email"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#1E3A5F] text-white px-4 py-2 rounded hover:bg-[#36597F]">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
