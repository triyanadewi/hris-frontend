// signin->idemployee->page.tsx
"use client"; // Menandai komponen ini sebagai Client Component

import { useState } from "react"; // Import useState hook
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Import Eye dan EyeOff icons

export default function SignInWithIDEmployee() {
  const [showPassword, setShowPassword] = useState(false); // State untuk visibilitas password

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Kiri - Ilustrasi */}
      <div className="w-full lg:w-1/2 bg-[#f0f4ff] flex items-center justify-center p-8">
        <Image
          src="/assets/img/signin.png"
          alt="Login Illustration"
          width={700}
          height={700}
          className="object-contain max-w-full h-auto"
        />
      </div>

      {/* Kanan - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between bg-[#ffffff] px-6 sm:px-12 md:px-16 lg:px-20 py-10">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/assets/img/LogoHRIS.png"
              alt="HRIS Logo"
              width={90}
              height={90}
            />
            <Link
              href="/signup"
              className="text-blue-600 font-semibold text-sm underline"
            >
              Try for free!
            </Link>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mb-3">
            Sign in with ID Employee
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome back to HRIS cmlabs! Manage everything with ease.
          </p>

          <form className="space-y-6">
            {/* Company Username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Company Username
              </label>
              <input
                type="text"
                placeholder="Enter your Company Username"
                className="w-full border border-gray-400 p-3 rounded"
              />
            </div>

            {/* ID Employee */}
            <div>
              <label className="block text-sm font-medium mb-1">
                ID Employee
              </label>
              <input
                type="text"
                placeholder="Enter your ID Employee"
                className="w-full border border-gray-400 p-2 rounded"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative"> {/* Tambahkan relative positioning */}
                <input
                  type={showPassword ? "text" : "password"} // Mengubah tipe input berdasarkan state showPassword
                  placeholder="Enter your password"
                  className="w-full border border-gray-400 p-2 rounded pr-10" // Tambahkan padding kanan untuk ikon
                />
                <button
                  type="button" // Penting: atur type menjadi button agar tidak submit form
                  className="absolute right-3 top-3 text-gray-600" // Posisikan ikon
                  onClick={() => setShowPassword(!showPassword)} // Toggle state showPassword
                >
                  {showPassword ? <EyeOff size={25} /> : <Eye size={25} />} {/* Render ikon sesuai state */}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="remember" className="flex items-center cursor-pointer">
                <input type="checkbox" id="remember" className="peer hidden" />
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200">
                  <svg
                    className="w-3 h-3 text-white hidden peer-checked:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="ml-3 text-sm">Remember Me</span>
              </label>

              <Link href="/forgotPassword" className="text-blue-600 font-medium">
                Forgot Password?
              </Link>
            </div>

            {/* Tombol Sign In */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
            >
              SIGN IN
            </button>

            {/* Tombol Sign in dengan metode lain */}
            <button
              type="button"
              className="w-full border border-black py-3 rounded font-semibold hover:bg-blue-100 transition"
            >
              Use a different sign-in method
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="pt-6">
          <hr className="my-9" />
          <p className="text-center text-sm">
            Don’t have an account yet?{" "}
            <Link href="/signup" className="text-blue-600 font-medium">
              Sign up now and get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}