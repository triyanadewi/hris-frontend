'use client';
import React, { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  MdOutlineSpaceDashboard,
  MdGroups,
  MdAccessTime,
  MdAssignment,
  MdLogout,
  MdSettings,
} from 'react-icons/md';
import axios from 'axios';
import Cookies from 'js-cookie';

type SidebarIconProps = {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
};

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`group flex items-center gap-4 p-3 rounded-md w-full transition-colors duration-300 overflow-hidden whitespace-nowrap
      ${active ? 'bg-[#1C3D5A] text-white' : 'text-gray-700 hover:bg-[#1C3D5A] hover:text-white'}`}
  >
    <div className="text-2xl">{icon}</div>
    <span className="text-sm hidden group-hover/sidebar:inline-block">{label}</span>
  </button>
);

const adminMenuItems = [
  { icon: <MdOutlineSpaceDashboard />, path: '/admin/dashboard', label: 'Dashboard' },
  { icon: <MdGroups />, path: '/admin/employee-database', label: 'Employee' },
  { icon: <MdAccessTime />, path: '/admin/checkclock', label: 'Checkclock' },
  { icon: <MdAssignment />, path: '/admin/letter-management', label: 'Letter' },
  { icon: <MdSettings />, path: '/admin/profile-admin', label: 'Profile' },
  { icon: <MdLogout />, path: 'logout', label: 'Logout' }, // Changed path to 'logout'
];

const userMenuItems = [
  { icon: <MdOutlineSpaceDashboard />, path: '/user/dashboard', label: 'Dashboard' },
  { icon: <MdAccessTime />, path: '/user/checkclock', label: 'Checkclock' },
  { icon: <MdAssignment />, path: '/user/letter-management', label: 'Letter' },
  { icon: <MdLogout />, path: 'logout', label: 'Logout' }, // Changed path to 'logout'
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const isUser = pathname.startsWith('/user');
  const menuItems = isAdmin ? adminMenuItems : isUser ? userMenuItems : [];

  const handleLogout = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        window.location.href = '/signin';
        return;
      }

      // Determine the correct logout endpoint based on user type
      const logoutEndpoint = isAdmin ? '/admin/logout' : '/user/logout';
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${logoutEndpoint}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear token and redirect regardless of API response
      Cookies.remove('token');
      window.location.href = '/signin';
    }
  };

  const handleMenuClick = (path: string) => {
    if (path === 'logout') {
      handleLogout();
    } else {
      router.push(path);
    }
  };

  return (
    <aside className="group/sidebar min-h-screen sticky top-0 transition-all duration-300 bg-white shadow-md hover:w-48 w-16 flex flex-col">
      {/* Header Section */}
      <div className="flex items-center gap-2 px-3 py-4 pl-5 flex-shrink-0">
        <img src="/logo.png" alt="Logo" className="w-6 h-auto" />
        <span className="hidden group-hover/sidebar:inline-block text-base font-semibold">HRIS</span>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-300 opacity-50 mx-3 flex-shrink-0" />

      {/* Menu Items - Takes up remaining space */}
      <div className="flex flex-col flex-1">
        {/* Main Menu Items */}
        <div className="flex flex-col gap-2 mt-4 w-full px-2">
          {menuItems.map(({ icon, path, label }) => {
            const active = path !== 'logout' && (pathname === path || pathname.startsWith(path + '/'));
            return (
              <SidebarIcon
                key={path}
                icon={icon}
                label={label}
                active={active}
                onClick={() => handleMenuClick(path)}
              />
            );
          })}
        </div>
      </div>
    </aside>
  );
}