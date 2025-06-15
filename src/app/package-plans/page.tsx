"use client";

import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAllPackages } from "@/lib/services/package";

// Interface untuk tipe data
interface PackageBenefit {
  id: number;
  package_id: number;
  max_branches: number;
  max_employees: number;
  access_duration_days: number;
  is_active: boolean;
}

interface Package {
  id: number;
  name: string;
  price: number;
  description: string;
  benefits: PackageBenefit[];
  features?: string[];
}

// Interface untuk response API
interface ApiResponse {
  data?: Package[];
  packages?: Package[];
  [key: string]: any; // untuk property lain yang mungkin ada
}

export default function PackagePlanPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [plans, setPlans] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk memformat durasi akses
  const formatAccessDuration = (days: number): string => {
    if (days <= 30) {
      return `${days} days access`;
    } else if (days <= 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""} access`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? "s" : ""} access`;
    }
  };

  // Fungsi untuk memformat jumlah karyawan
  const formatEmployeeLimit = (count: number): string => {
    if (count >= 1000000) {
      return "Unlimited employees";
    }
    return `Up to ${count.toLocaleString()} employees`;
  };

  // Fungsi untuk memformat jumlah cabang
  const formatBranchLimit = (count: number): string => {
    if (count >= 1000000) {
      return "Unlimited branch offices";
    } else if (count === 1) {
      return "Head Office only";
    }
    return `Head Office with ${count - 1} branch office${count > 2 ? "s" : ""}`;
  };

  // Fungsi untuk menggenerate features berdasarkan package_benefits
  const generateFeatures = (packageBenefit: PackageBenefit): string[] => {
    const features: string[] = [];

    features.push(formatAccessDuration(packageBenefit.access_duration_days));
    features.push(formatEmployeeLimit(packageBenefit.max_employees));
    features.push(formatBranchLimit(packageBenefit.max_branches));

    return features;
  };

  const handleSelectPackage = (plan: Package) => {
    // Ambil benefit pertama (asumsi setiap package punya 1 benefit aktif)
    const benefit =
      plan.benefits && plan.benefits.length > 0 ? plan.benefits[0] : null;

    if (!benefit) {
      alert("Package benefit not found");
      return;
    }

    // Redirect ke checkout dengan semua data yang diperlukan
    const queryParams = new URLSearchParams({
      packageId: plan.id.toString(),
      packageName: plan.name,
      packagePrice: plan.price.toString(),
      packageDescription: plan.description,
      benefitId: benefit.id.toString(),
      maxBranches: benefit.max_branches.toString(),
      maxEmployees: benefit.max_employees.toString(),
      accessDuration: benefit.access_duration_days.toString(),
    });

    router.push(`/checkout?${queryParams.toString()}`);
  };

  useEffect(() => {
    setLoading(true);
    getAllPackages()
      .then((response: any) => {
        // Menggunakan 'any' untuk menghindari error TypeScript
        console.log("API Response:", response); // Debug log

        // Periksa struktur response
        let packagesData: Package[] = [];

        if (Array.isArray(response)) {
          // Jika response langsung array
          packagesData = response;
        } else if (response && typeof response === "object") {
          // Jika response berupa object, cek berbagai kemungkinan property
          if (Array.isArray(response.data)) {
            packagesData = response.data;
          } else if (Array.isArray(response.packages)) {
            packagesData = response.packages;
          } else {
            // Fallback jika struktur tidak sesuai
            console.warn("Unexpected API response structure:", response);
            packagesData = [];
          }
        } else {
          // Jika response bukan array atau object
          console.warn("Unexpected API response type:", typeof response);
          packagesData = [];
        }

        setPlans(packagesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching packages:", err);
        setError("Failed to load package plans. Please try again later.");
        setPlans([]); // Set sebagai array kosong jika error
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#e8f1fb] min-h-screen py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          HRIS Pricing Plans
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Choose the package that best suits your business!
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
                    index === 1
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
                    index === 1 ? "bg-[#1E3A5F]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          )
        )}
      </div>

      <div className="container mx-auto">
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : plans.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No packages available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => {
              // Menggunakan features dari API jika tersedia, atau generate sendiri
              const features =
                plan.features ||
                (plan.benefits && plan.benefits.length > 0
                  ? generateFeatures(plan.benefits[0])
                  : []);

              return (
                <div
                  key={plan.id ?? idx}
                  className="bg-white border border-gray-200 rounded-xl shadow-md p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-xl text-sm">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-700 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-800 mb-4">
                      {plan.price === 0
                        ? "Rp. 0"
                        : `Rp. ${plan.price.toLocaleString()}`}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {plan.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {features.map((feature: string, fidx: number) => (
                        <li
                          key={fidx}
                          className="flex items-center text-gray-700 text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPackage(plan)}
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition cursor-pointer">
                    Select a Package →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="container mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/CompanyProfile")}
          className="fixed bottom-6 right-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded shadow-md transition">
          ← Back
        </button>
      </div>
    </div>
  );
}
