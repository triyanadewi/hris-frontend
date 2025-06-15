"use client";

import Image from "next/image";
import Link from "next/link";

export default function SuccessfullyResetPage() {
  return (
    <div className="flex min-h-screen">
      {/* Kiri - Informasi */}
      <div className="w-full lg:w-1/2 bg-[#e7edf7] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-20 relative">
        {/* Logo HRIS */}
        <div className="absolute top-10 left-20">
          <Image src="/assets/img/LogoHRIS.png" alt="HRIS Logo" width={90} height={90} />
        </div>

        <div className="text-center max-w-md mt-2">
          {/* Ikon Centang */}
          <div className="flex justify-center mb-6">
            <div>
              <Image src="/assets/icons/checkSquare.png" alt="Success Icon" width={90} height={90} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-4xl font-bold mb-4">
            Your password has been successfully reset
          </h1>
          <p className="text-gray-700 mb-8">
            You can log in with your new password. If you encounter any issues,
            please contact support.
          </p>

          <Link href="/signin">
            <button className="bg-[#1f305e] text-white px-40 py-4 rounded font-semibold hover:bg-[#162446] transition">
              Sign in Now
            </button>
          </Link>
        </div>
      </div>

      {/* Kanan - Ilustrasi */}
      <div className="hidden lg:flex w-1/2 justify-center items-center bg-white p-10">
        <Image
          src="/assets/img/successReset.png" // ilustrasi halaman
          alt="Success Reset Illustration"
          width={700}
          height={700}
          className="object-contain"
        />
      </div>
    </div>
  );
}