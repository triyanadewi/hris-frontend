"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const packagePlans = [
  { title: "Free Trial", price: 0 },
  { title: "Starter", price: 500000 },
  { title: "Growth", price: 1800000 },
  { title: "Pro", price: 3600000 },
  { title: "Enterprise", price: 7200000 },
];

const paymentMethods = [
  { label: "Select Payment Method", value: "" },
  { label: "Virtual Account - BCA", value: "va_bca" },
  { label: "Virtual Account - BNI", value: "va_bni" },
  { label: "Virtual Account - BRI", value: "va_bri" },
  { label: "E-Wallet - OVO", value: "ewallet_ovo" },
  { label: "E-Wallet - DANA", value: "ewallet_dana" },
];

const paymentOptions = {
  "Virtual Account": ["BCA", "Mandiri", "BNI", "BRI", "Permata", "CIMB Niaga"],
  eWallet: ["OVO", "DANA", "LinkAja", "ShopeePay"],
  QRIS: ["QRIS"],
  "Credit / Debit Card": ["Visa", "Mastercard", "JCB"],
};

function CheckoutContent() {
  const [isShopeePaySelected, setIsShopeePaySelected] = useState(false);
  const [plan, setPlan] = useState("Basic");
  const [price, setPrice] = useState(0);
  const [branches, setBranches] = useState(0);
  const [addonEmployees, setAddonEmployees] = useState(0);
  const [companies, setCompanies] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [countdown, setCountdown] = useState(24 * 60 * 60);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setPlan(searchParams.get("plan") ?? "Basic");
    setPrice(parseInt(searchParams.get("price") ?? "0"));
    setBranches(parseInt(searchParams.get("branches") ?? "0"));
    setAddonEmployees(parseInt(searchParams.get("addonEmployees") ?? "0"));

    // Fetch company from API
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/companies`)
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setCompanies({
            name: data[0].name,
            email: data[0].email,
            phone: data[0].head_office_phone,
          });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch company data", err);
        setCompanies({
          name: "N/A",
          email: "N/A",
          phone: "N/A",
        });
      });
  }, [searchParams]);

  const basePrice = packagePlans.find((p) => p.title === plan)?.price ?? 0;
  const branchPrice = branches * 50000;
  const employeePrice = addonEmployees * 5000;
  const subtotal = basePrice + branchPrice + employeePrice;
  const tax = subtotal * 0.1;
  const totalFinal = subtotal + tax;

  const handleClose = () => {
    const selectedPlan = packagePlans.find((p) => p.title === plan);
    const price = selectedPlan?.price ?? 0;

    const params = new URLSearchParams({
      plan,
      price: price.toString(),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const handlePayment = () => {
    if (!selectedMethod) {
      alert("Please select a payment method first.");
      return;
    }

    alert(`Payment using ${selectedMethod} was successful!`);
    router.push("/user/subscription-status");
  };

  const formatCountdown = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-md p-6">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>

        <h1 className="text-2xl font-bold text-center mb-2">
          Checkout Payment
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Please complete your payment!
        </p>

        <div className="bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-md p-4 mb-4 text-center">
          <p className="font-medium">Remaining Time:</p>
          <p className="text-lg font-bold">{formatCountdown(countdown)}</p>
        </div>

        <div className="bg-gray-50 border rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2 text-black">
            Order Summary
          </h2>
          <ul className="text-sm text-black space-y-1">
            <li className="flex justify-between">
              <span>Package</span>
              <span>{plan}</span>
            </li>
            <li className="flex justify-between">
              <span>Company Name</span>
              <span>{companies.name}</span>
            </li>
            <li className="flex justify-between">
              <span>Email</span>
              <span>{companies.email}</span>
            </li>
            <li className="flex justify-between">
              <span>Phone Number</span>
              <span>{companies.phone}</span>
            </li>
            <li className="flex justify-between">
              <span>Base Price</span>
              <span>Rp {basePrice.toLocaleString("id-ID")}</span>
            </li>
            {branches > 0 && (
              <li className="flex justify-between">
                <span>Add Branch</span>
                <span>Rp {branchPrice.toLocaleString("id-ID")}</span>
              </li>
            )}
            {addonEmployees > 0 && (
              <li className="flex justify-between">
                <span>Add Employee</span>
                <span>Rp {employeePrice.toLocaleString("id-ID")}</span>
              </li>
            )}
            <li className="flex justify-between">
              <span>Tax (10%)</span>
              <span>Rp {tax.toLocaleString("id-ID")}</span>
            </li>
            <li className="flex justify-between font-bold pt-2 border-t">
              <span>Total</span>
              <span>Rp {totalFinal.toLocaleString("id-ID")}</span>
            </li>
          </ul>
        </div>

        {/* Payment Method Dropdown */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={`w-full py-2 px-4 rounded-md font-semibold shadow border transition ${
              selectedMethod
                ? "border-gray-800 bg-white text-gray-800 hover:bg-gray-100"
                : "border-gray-800 bg-white text-gray-800 hover:bg-gray-100"
            }`}
          >
            {selectedMethod
              ? `Method: ${selectedCategory} - ${selectedMethod}`
              : "Select Payment Method"}
          </button>
        </div>

        {isShopeePaySelected && (
          <div className="bg-blue-50 border border-blue-300 rounded-md p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              Langkah Pembayaran dengan ShopeePay
            </h2>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal pl-5">
              <li>Buka aplikasi Shopee di ponsel Anda.</li>
              <li>Masuk ke menu ShopeePay di halaman utama aplikasi.</li>
              <li>Pilih opsi &quot;Scan QR Code&quot;.</li>
              <li>
                Arahkan kamera ponsel Anda ke QR Code yang ditampilkan di layar.
              </li>
              <li>
                Pastikan jumlah pembayaran sudah sesuai, lalu konfirmasi
                pembayaran.
              </li>
              <li>Masukkan PIN ShopeePay untuk menyelesaikan transaksi.</li>
              <li>
                Pembayaran Anda berhasil! Periksa status pembayaran di aplikasi
                Shopee.
              </li>
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Payment
        </button>
      </div>

      {/* MODAL PEMBAYARAN */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-md p-6 overflow-auto max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4 text-center">
              Select Payment Method
            </h2>

            {(
              Object.keys(paymentOptions) as Array<keyof typeof paymentOptions>
            ).map((category) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? "" : category
                    )
                  }
                  className="w-full flex justify-between items-center text-left text-sm font-medium text-gray-700 bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
                >
                  <span>{category}</span>
                  <span>{selectedCategory === category ? "-" : "+"}</span>
                </button>
                {selectedCategory === category && (
                  <div className="mt-2 ml-4 space-y-2">
                    {paymentOptions[category].map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setSelectedMethod(method);
                          setShowModal(false);
                          setIsShopeePaySelected(method === "ShopeePay");
                        }}
                        className={`block w-full text-left p-2 rounded-md text-sm ${
                          selectedMethod === method
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>{" "}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          Loading...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
