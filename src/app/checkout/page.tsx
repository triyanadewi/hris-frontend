"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAuthenticatedCompany } from "@/lib/services/company";
import {
  createOrder,
  createPayment,
  generateQRISData,
  processCheckout,
  checkPaymentStatus,
  CreateOrderData,
  CreatePaymentData,
  OrderResponse,
  PaymentResponse,
} from "@/lib/services/checkout";

// Payment method types
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "bank_transfer" | "ewallet" | "qris" | "credit_card";
}

// Available payment methods
const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR Code untuk pembayaran",
    icon: "📱",
    type: "qris",
  },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State untuk form data
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [branches, setBranches] = useState(0);
  const [addonEmployees, setAddonEmployees] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [step, setStep] = useState<"form" | "payment" | "qris">("form");

  // QRIS related states
  const [qrisData, setQrisData] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [orderId, setOrderId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<string>("");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Package details dari URL params
  const packageId = searchParams.get("packageId");
  const packageName = searchParams.get("packageName") || "";
  const packagePrice = parseInt(searchParams.get("packagePrice") || "0");
  const packageDescription = searchParams.get("packageDescription") || "";
  const benefitId = searchParams.get("benefitId");
  const maxBranches = parseInt(searchParams.get("maxBranches") || "1");
  const maxEmployees = parseInt(searchParams.get("maxEmployees") || "0");
  const accessDuration = parseInt(searchParams.get("accessDuration") || "30");

  // Pricing constants
  const branchPrice = 50000;
  const employeePrice = 5000;

  // Calculations
  const basePrice = packagePrice;
  const branchCost = branches * branchPrice;
  const employeeCost = addonEmployees * employeePrice;
  const subtotal = basePrice + branchCost + employeeCost;
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax;

  // Format countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "qris" && timeLeft > 0 && !isPaymentComplete) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setError("Payment time expired. Please try again.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, timeLeft, isPaymentComplete]);

  // Payment status checker for QRIS
  useEffect(() => {
    let statusChecker: NodeJS.Timeout;

    if (
      step === "qris" &&
      orderId &&
      paymentId &&
      !isPaymentComplete &&
      timeLeft > 0
    ) {
      statusChecker = setInterval(async () => {
        try {
          const status = await checkPaymentStatus(orderId, paymentId);
          if (status.status === "paid" || status.status === "completed") {
            setIsPaymentComplete(true);
            clearInterval(statusChecker);

            // Show success message and redirect
            setTimeout(() => {
              alert("Payment successful! Redirecting to Company Detail...");
              router.push("/CompanyDetail");
            }, 1000);
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
          // Continue checking, don't break the flow
        }
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (statusChecker) clearInterval(statusChecker);
    };
  }, [step, orderId, paymentId, isPaymentComplete, timeLeft, router]);

  // Format access duration untuk display
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

  // Format employee limit untuk display
  const formatEmployeeLimit = (count: number): string => {
    if (count >= 1000000) {
      return "Unlimited employees";
    }
    return `Up to ${count.toLocaleString()} employees`;
  };

  // Format branch limit untuk display
  const formatBranchLimit = (count: number): string => {
    if (count >= 1000000) {
      return "Unlimited branch offices";
    } else if (count === 1) {
      return "Head Office only";
    }
    return `Head Office with ${count - 1} branch office${count > 2 ? "s" : ""}`;
  };

  // Load company data saat component mount
  useEffect(() => {
    const loadCompanyData = async () => {
      setCompanyLoading(true);
      try {
        // Gunakan service function yang sudah diimport
        const companyData = await getAuthenticatedCompany();

        console.log("Company data loaded:", companyData);

        if (companyData) {
          setCompanyName(companyData.name || "");
          setEmail(companyData.email || "");
          setPhoneNumber(companyData.phone || "");
        } else {
          console.log("No company data found");
          setCompanyName("");
          setEmail("");
          setPhoneNumber("");
        }
      } catch (err) {
        console.error("Error loading company data:", err);
        setError("Failed to load company information");
      } finally {
        setCompanyLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  // Validasi jika tidak ada package data
  useEffect(() => {
    if (!packageId || !benefitId) {
      setError("Package data not found. Please select a package first.");
    }
  }, [packageId, benefitId]);

  // Add debugging useEffect
  useEffect(() => {
    console.log("Current state:", {
      step,
      companyName,
      email,
      phoneNumber,
      selectedPaymentMethod,
      total,
      loading,
      error,
      packageId,
      benefitId,
    });
  }, [
    step,
    companyName,
    email,
    phoneNumber,
    selectedPaymentMethod,
    total,
    loading,
    error,
    packageId,
    benefitId,
  ]);

  const handleContinueToPayment = () => {
    if (!companyName || !email || !phoneNumber) {
      setError("Please fill in all required fields");
      return;
    }

    if (!packageId || !benefitId) {
      setError("Package information is missing");
      return;
    }

    setError(null);
    setStep("payment");
  };

  const handleBackToForm = () => {
    setStep("form");
    setSelectedPaymentMethod("");
    setError(null);
  };

  const handleBackToPayment = () => {
    setStep("payment");
    setError(null);
    setTimeLeft(900); // Reset timer
  };

  const handleCheckout = async () => {
    if (!selectedPaymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Starting checkout process...");

      // Validate all required data
      if (!companyName || !email || !phoneNumber) {
        throw new Error("Missing required company information");
      }

      if (!benefitId) {
        throw new Error("Package benefit ID is missing");
      }

      // Prepare order data
      const orderData: CreateOrderData = {
        package_benefits_id: parseInt(benefitId!),
        add_branch: branches,
        add_employees: addonEmployees,
        company_name: companyName,
        email: email,
        phone_number: phoneNumber,
      };

      // Prepare payment data
      const paymentData: Omit<CreatePaymentData, "description"> = {
        payment_method: selectedPaymentMethod,
        amount: total,
      };

      // Process checkout using the service
      const { order, payment } = await processCheckout(
        orderData,
        paymentData,
        packageName
      );

      setOrderId(order.id);
      setPaymentId(payment.id);

      // Handle different payment methods
      if (selectedPaymentMethod === "qris") {
        const qrisString = generateQRISData(total, `ORDER-${order.id}`);
        setQrisData(qrisString);
        setStep("qris");
        setTimeLeft(900); // Reset to 15 minutes
      } else {
        // For other payment methods, redirect normally
        if (payment.payment_url) {
          window.location.href = payment.payment_url;
        } else {
          router.push(`/payment/${order.id}?payment_id=${payment.id}`);
        }
      }
    } catch (err: any) {
      console.error("Error during checkout:", err);
      setError(err.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = () => {
    setIsPaymentComplete(true);
    setError(null);

    // Simulate successful payment after 2 seconds
    setTimeout(() => {
      alert("Payment successful! Redirecting to Company Detail...");
      router.push("/CompanyDetail");
    }, 2000);
  };

  const handleBack = () => {
    router.push("/package-plans");
  };

  const handleBackToProfile = () => {
    router.push("/CompanyProfile");
  };

  // Show loading state while loading company data
  if (companyLoading) {
    return (
      <div className="bg-[#e8f1fb] min-h-screen py-12 px-4">
        <div className="text-center py-20">
          <div className="text-gray-600 mb-4">
            Loading company information...
          </div>
        </div>
      </div>
    );
  }

  // Show error if package data missing or company profile not found
  if (
    error &&
    (!packageId || !benefitId || error.includes("Company profile not found"))
  ) {
    return (
      <div className="bg-[#e8f1fb] min-h-screen py-12 px-4">
        <div className="text-center py-20">
          <div className="text-red-500 mb-4">{error}</div>
          {error.includes("Company profile not found") ? (
            <div className="space-x-4">
              <button
                onClick={handleBackToProfile}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Complete Company Profile
              </button>
              <button
                onClick={handleBack}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Back to Packages
              </button>
            </div>
          ) : (
            <button
              onClick={handleBack}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Back to Packages
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e8f1fb] min-h-screen py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          HRIS Pricing Plans
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
          Enjoy the convenience of our HRIS with flexible payment options
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
                    index === 2
                      ? "bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-lg"
                      : "bg-white text-[#1E3A5F] border-[#1E3A5F]"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm mt-2 text-gray-600 w-24 text-center font-medium">
                  {label}
                </span>
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-1 mx-4 rounded-full ${
                    index === 2 ? "bg-[#1E3A5F]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          )
        )}
      </div>

      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Form, Payment Methods, or QRIS */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {step === "form" ? (
                  // Form Step
                  <>
                    {/* Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {packageName}
                      </h2>
                      <p className="text-gray-600">{packageDescription}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <div>• {formatAccessDuration(accessDuration)}</div>
                        <div>• {formatEmployeeLimit(maxEmployees)}</div>
                        <div>• {formatBranchLimit(maxBranches)}</div>
                      </div>
                    </div>

                    {error && !error.includes("Company profile not found") && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Company Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          placeholder="Enter company name"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This information is loaded from your company profile
                        </p>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          placeholder="Enter email address"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This information is loaded from your company profile
                        </p>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                          placeholder="Enter phone number"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This information is loaded from your company profile
                        </p>
                      </div>

                      {/* Add Branch */}
                      <div className="flex justify-between items-center py-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Add Branch
                          </h3>
                          <p className="text-sm text-gray-500">
                            Rp {branchPrice.toLocaleString()}/branch
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setBranches(Math.max(0, branches - 1))
                            }
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={branches}
                            onChange={(e) =>
                              setBranches(
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            }
                            className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setBranches(branches + 1)}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Add Employees */}
                      <div className="flex justify-between items-center py-4 border-b border-gray-200">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Add Employees
                          </h3>
                          <p className="text-sm text-gray-500">
                            Rp {employeePrice.toLocaleString()}/user
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setAddonEmployees(Math.max(0, addonEmployees - 1))
                            }
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={addonEmployees}
                            onChange={(e) =>
                              setAddonEmployees(
                                Math.max(0, parseInt(e.target.value) || 0)
                              )
                            }
                            className="w-16 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAddonEmployees(addonEmployees + 1)
                            }
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 pt-6">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                        >
                          Back to Package Selection
                        </button>
                        <button
                          type="button"
                          onClick={handleContinueToPayment}
                          disabled={!companyName || !email || !phoneNumber}
                          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  </>
                ) : step === "payment" ? (
                  // Payment Methods Step
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Choose Payment Method
                      </h2>
                      <p className="text-gray-600">
                        Select your preferred payment method to complete the
                        purchase
                      </p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                      </div>
                    )}

                    {/* Payment Methods Grid */}
                    <div className="space-y-3 mb-6">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedPaymentMethod === method.id
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{method.icon}</span>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {method.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedPaymentMethod === method.id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedPaymentMethod === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-6">
                      <button
                        type="button"
                        onClick={handleBackToForm}
                        className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                      >
                        Back to Form
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={loading || !selectedPaymentMethod}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading
                          ? "Processing Payment..."
                          : `Pay Rp ${total.toLocaleString()}`}
                      </button>
                    </div>
                  </>
                ) : (
                  // QRIS Step
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Scan QRIS Code
                      </h2>
                      <p className="text-gray-600">
                        Gunakan aplikasi mobile banking atau e-wallet untuk scan
                        QR code
                      </p>
                    </div>

                    {error && timeLeft === 0 && (
                      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                      </div>
                    )}

                    {isPaymentComplete ? (
                      // Payment Success State
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Payment Processing...
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Your payment is being processed. Please wait...
                        </p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        {/* Timer */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-blue-900">
                                Time remaining:
                              </span>
                            </div>
                            <span className="text-lg font-bold text-blue-900">
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                        </div>

                        {/* QR Code Display */}
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                          <div className="bg-gray-100 rounded-lg p-6 mb-4">
                            <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center border-2 border-gray-200">
                              {/* Static QR Code Pattern */}
                              <div className="w-40 h-40 bg-black relative">
                                <div className="absolute inset-0 grid grid-cols-8 gap-px">
                                  {/* Generate a simple QR-like pattern */}
                                  {Array.from({ length: 64 }, (_, i) => (
                                    <div
                                      key={i}
                                      className={`
                                      ${
                                        Math.random() > 3
                                          ? "bg-black"
                                          : "bg-white"
                                      }
                                      ${
                                        i < 8 ||
                                        i >= 56 ||
                                        i % 8 === 0 ||
                                        i % 8 === 7
                                          ? "bg-black"
                                          : ""
                                      }
                                    `}
                                    />
                                  ))}
                                </div>
                                {/* Corner squares */}
                                <div className="absolute top-1 left-1 w-6 h-6 bg-black">
                                  <div className="absolute top-1 left-1 w-4 h-4 bg-white">
                                    <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                                  </div>
                                </div>
                                <div className="absolute top-1 right-1 w-6 h-6 bg-black">
                                  <div className="absolute top-1 left-1 w-4 h-4 bg-white">
                                    <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                                  </div>
                                </div>
                                <div className="absolute bottom-1 left-1 w-6 h-6 bg-black">
                                  <div className="absolute top-1 left-1 w-4 h-4 bg-white">
                                    <div className="absolute top-1 left-1 w-2 h-2 bg-black"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                              Scan QR code with your mobile banking or e-wallet
                              app
                            </p>
                          </div>

                          {/* Payment Details */}
                          <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">
                                Amount:
                              </span>
                              <span className="font-semibold">
                                Rp {total.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">
                                Order ID:
                              </span>
                              <span className="font-mono text-sm">
                                {orderId ? `ORDER-${orderId}` : "Loading..."}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Package:
                              </span>
                              <span className="text-sm">{packageName}</span>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="text-left text-sm text-gray-600 space-y-2">
                            <p className="font-medium">Cara pembayaran:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-4">
                              <li>
                                Buka aplikasi mobile banking atau e-wallet
                              </li>
                              <li>Pilih menu scan QR atau QRIS</li>
                              <li>Scan QR code di atas</li>
                              <li>
                                Konfirmasi pembayaran sebesar Rp{" "}
                                {total.toLocaleString()}
                              </li>
                              <li>Selesaikan transaksi</li>
                            </ol>
                          </div>
                        </div>

                        {/* Simulate Payment Button for Demo */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                          <div className="flex items-start space-x-3">
                            <svg
                              className="w-5 h-5 text-yellow-600 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-yellow-900">
                                Demo Mode
                              </h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                This is a demo. Click the button below to
                                simulate successful payment.
                              </p>
                              <button
                                onClick={handleSimulatePayment}
                                className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
                              >
                                Simulate Payment Success
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={handleBackToPayment}
                            disabled={timeLeft === 0}
                            className="w-full py-3 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Back to Payment Methods
                          </button>
                          {timeLeft === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setStep("payment");
                                setTimeLeft(900);
                                setError(null);
                              }}
                              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                              Try Again
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>

                {/* Package Details */}
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Package</span>
                    <span className="text-sm font-medium">{packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Base Price</span>
                    <span className="text-sm">
                      Rp {basePrice.toLocaleString()}
                    </span>
                  </div>
                  {branches > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Additional Branches ({branches})
                      </span>
                      <span className="text-sm">
                        Rp {branchCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {addonEmployees > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Additional Employees ({addonEmployees})
                      </span>
                      <span className="text-sm">
                        Rp {employeeCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm">
                      Rp {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax (10%)</span>
                    <span className="text-sm">Rp {tax.toLocaleString()}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {total.toLocaleString()}
                  </span>
                </div>

                {/* Company Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Billing Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{companyName}</p>
                    <p>{email}</p>
                    <p>{phoneNumber}</p>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span
                      className={
                        step === "form" ? "text-blue-600 font-medium" : ""
                      }
                    >
                      Details
                    </span>
                    <span
                      className={
                        step === "payment" ? "text-blue-600 font-medium" : ""
                      }
                    >
                      Payment
                    </span>
                    <span
                      className={
                        step === "qris" ? "text-blue-600 font-medium" : ""
                      }
                    >
                      Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          step === "form"
                            ? "33%"
                            : step === "payment"
                            ? "66%"
                            : "100%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>{" "}
      </div>
    </div>
  );
}

// Loading component for Suspense boundary
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading checkout...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Checkout() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
