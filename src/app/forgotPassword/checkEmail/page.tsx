// forgotPassword/checkEmail/page.tsx

import Image from "next/image";
import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Kiri - Teks & Aksi */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 lg:px-20 py-10 bg-white">
        {/* Logo */}
        <div className="absolute top-10 left-20">
          <Image
            src="/assets/img/LogoHRIS.png"
            alt="HRIS Logo"
            width={90}
            height={90}
          />
        </div>

        <div className="max-w-md w-full text-center">
          {/* Ikon centang */}
          <div className="flex justify-center mb-10">
            <div className="bg-green-800 rounded-full p-4">
              <svg
                className="w-15 h-15 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Teks utama */}
          <h1 className="text-5xl font-bold mb-12">Check your email</h1>
          <p className="text-gray-600 mb-12">
            We sent a password reset link to your email (<strong>uremail@gmail.com</strong>) which valid for 24 hours after receives the email. Please check your inbox!
          </p>

          {/* Tombol Open Gmail */}
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full bg-gray-800 text-white py-3 rounded font-semibold hover:bg-gray-900 transition mb-7"
          >
            Open Gmail
          </a>

          {/* Link resend dan kembali */}
          <p className="text-sm text-gray-600">
            Don’t receive the email?{" "}
            <Link href="#" className="text-blue-600 underline">
              Click here to resend!
            </Link>
          </p>

          <div className="mt-12">
            <Link href="/signin" className="text-sm text-gray-800 hover:underline inlin font-bold">
              ← Back to Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Kanan - Ilustrasi */}
      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-[#f0f4ff] p-8">
        <Image
          src="/assets/img/checkEmail.png"
          alt="Check Email Illustration"
          width={700}
          height={700}
          className="object-contain"
        />
      </div>
    </div>
  );
}