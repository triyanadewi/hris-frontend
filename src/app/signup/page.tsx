"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerAdmin } from "@/lib/services/auth";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  type Errors = {
    email?: string[];
    password?: string[];
    [key: string]: string[] | undefined;
  };

  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");

    try {
      await registerAdmin({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      setMessage("Registration successful! Redirecting to Sign In...");
      setTimeout(() => router.push("/signin"), 2000);
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage("Registration failed.");
      }
    }
  };

  const handleGoogleSignup = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Gambar */}
      <div className="w-full lg:w-1/2 bg-[#f0f4ff] flex items-center justify-center p-8">
        <Image
          src="/assets/img/signup.png"
          alt="Signup Illustration"
          width={700}
          height={700}
        />
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white px-6 sm:px-12 md:px-16 lg:px-20 py-10">
        <div>
          <div className="flex justify-between items-center mb-8">
            <Image
              src="/assets/img/LogoHRIS.png"
              alt="HRIS Logo"
              width={90}
              height={90}
            />
            <Link
              href="/signin"
              className="text-blue-600 font-semibold text-sm underline"
            >
              Sign In here!
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-3">Sign Up</h1>
          <p className="text-gray-600 mb-6">Create your account as admin.</p>

          {message && <p className="text-green-600 mb-4">{message}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full border border-gray-400 p-2 rounded"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full border border-gray-400 p-2 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full border border-gray-400 p-2 rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border border-gray-400 p-2 rounded pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter your confirm password"
                  className="w-full border border-gray-400 p-2 rounded pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={25} />
                  ) : (
                    <Eye size={25} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-5 h-5 appearance-none border-2 border-gray-400 rounded-full checked:bg-blue-600 checked:border-transparent transition duration-200"
              />
              <label htmlFor="terms">
                I agree with the terms of use of HRIS
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
            >
              SIGN UP
            </button>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full border border-black py-3 rounded font-semibold hover:bg-blue-100 transition"
            >
              Sign up with Google
            </button>
          </form>
        </div>

        <div className="pt-6">
          <hr className="my-9" />
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-600 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
