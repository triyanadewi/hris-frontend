"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function SetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Password dan konfirmasi password tidak sama!");
    } else {
      alert("Password berhasil diubah!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#ffffff]">
      {/* Kiri - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-20 py-10">
        <div className="absolute top-10 left-20">
          <Image src="/assets/img/LogoHRIS.png" alt="HRIS Logo" width={90} height={90} />
        </div>

        <div className="max-w-md w-full text-center mt-10">
          <h1 className="text-5xl font-bold mb-4">Set new password</h1>
          <p className="text-gray-600 mb-8">
            Enter your new password below to complete the reset process. <br />
            Ensure it’s strong and secure
          </p>

          <form className="space-y-6 text-left" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label className="block font-medium mb-1">New Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-400 p-3 rounded"
              />
              <p className="text-sm text-blue-600 mt-1">Must be at least 8 character</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-400 p-3 rounded"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#1f305e] text-white py-3 rounded font-semibold hover:bg-[#152544] transition"
            >
              Reset password
            </button>
          </form>

          <div className="mt-6 text-sm">
            <Link href="/signin" className="text-gray-800 font-semibold hover:underline inline-flex items-center">
              ← Back to Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Kanan - Ilustrasi */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-[#f0f4ff] p-8">
        <Image
          src="/assets/img/setPassword.png"
          alt="Set Password Illustration"
          width={700}
          height={700}
          className="object-contain"
        />
      </div>
    </div>
  );
}