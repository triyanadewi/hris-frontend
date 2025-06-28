"use client";

import { FiBell, FiSearch } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from 'js-cookie';
import axios from 'axios';

interface UserProfile {
  first_name?: string;
  photo?: string;
}

export default function Topbar({ title }: { title: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserProfile>({});

  const handleLogout = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        window.location.href = '/signin';
        return;
      }

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      window.location.href = '/signin';
    }
  };

  const fetchUserProfile = async () => {
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUser(res.data); // axios automatically parses JSON
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const profileImageUrl = user.photo
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/photos/${user.photo}`
    : "/default-avatar.png";

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#1C3D5A] text-white w-full shadow-md relative">
      {/* Title */}
      <h1 className="text-lg font-bold">{title}</h1>

      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-md px-2 py-1 w-1/3 text-black">
        <FiSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none w-full"
        />
      </div>

      {/* Icons & User Menu */}
      <div className="flex items-center gap-4 relative">
        <div className="p-2 rounded-full hover:bg-white hover:text-[#1C3D5A] transition">
          <FiBell className="text-lg" />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="flex items-center gap-2">
            <img
              src={profileImageUrl}
              alt="User"
              className="w-8 h-8 rounded-full object-cover border"
            />
            <span className="text-sm">{user.first_name || "Admin"} ⏷</span>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-md w-40 z-50">
              <Link href="/admin/view-profile" className="block px-4 py-2 hover:bg-gray-100">
                View Profile
              </Link>
              <Link href="/admin/edit-profile" className="block px-4 py-2 hover:bg-gray-100">
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
