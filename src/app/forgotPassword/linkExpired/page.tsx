"use client";

import Image from "next/image";
import Link from "next/link";

export default function LinkExpiredPage() {
  return (
    <div className="flex min-h-screen">
      {/* Kiri - Pesan Expired */}
      <div className="w-full lg:w-1/2 bg-[#e7edf7] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-20 relative">
        {/* Logo HRIS */}
        <div className="absolute top-10 left-20">
          <Image src="/assets/img/LogoHRIS.png" alt="HRIS Logo" width={90} height={90} />
        </div>

        <div className="text-center max-w-md mt-2">
          {/* Ikon Clock */}
          <div className="flex justify-center mb-5">
            <div>
              <Image src="/assets/icons/Clock.png" alt="Clock Icon" width={90} height={90} />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-10">Link Expired</h1>
          <p className="text-gray-700 mb-15">
            The password reset link has expired. <br />
            Please request a new link to reset your password.
          </p>

          <Link href="/signin">
            <button className="bg-[#1f305e] text-white px-35 py-3 rounded font-semibold hover:bg-[#162446] transition">
              Back to Sign in
            </button>
          </Link>
        </div>
      </div>

      {/* Kanan - Ilustrasi */}
      <div className="hidden lg:flex w-1/2 justify-center items-center bg-white p-10">
        <Image
          src="/assets/img/linkExpired.png" // Simpan ilustrasi di sini
          alt="Link Expired Illustration"
          width={700}
          height={700}
          className="object-contain"
        />
      </div>
    </div>
  );
}