'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FaCircle } from 'react-icons/fa';
import { usePageTitle } from '@/context/PageTitleContext';

// Data statis
const attendanceData = [
  { name: 'On time', value: 289, color: '#14532D' },
  { name: 'Late',    value:  89, color: '#A16207' },
  { name: 'Absent',  value:  23, color: '#991B1B' },
];
const workHoursData = [
  { date: 'March 20', hours: 30 },
  { date: 'March 21', hours: 45 },
  { date: 'March 22', hours: 60 },
  { date: 'March 23', hours: 30 },
  { date: 'March 24', hours: 45 },
  { date: 'March 25', hours: 50 },
  { date: 'March 26', hours: 30 },
];

// Helper untuk default week ISO string: YYYY-Www
function getCurrentWeekString() {
  const today = new Date();
  const target = new Date(today.valueOf());
  const dayNr = (today.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNo = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${today.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Disable SSR karena Recharts generate ID acak
export default dynamic(() => Promise.resolve(UserDashboard), { ssr: false });

function UserDashboard() {
  const { setTitle } = usePageTitle();

  // State untuk filter
  const [selectedDate,  setSelectedDate]  = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek,  setSelectedWeek]  = useState(getCurrentWeekString());

  // Placeholder statis untuk date
  const datePlaceholder = useMemo(() => 'Choose the date', []);

  setTitle('Dashboard');

  const handleRequestLeave = () => alert('Request leave berhasil!');
  const handleSeeDetail     = () => alert('Menampilkan detail cuti...');

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">

      {/* Bar atas: filter tanggal di pojok kiri */}
      <div className="flex justify-start mb-4">
        <input
          type="date"
          className="px-4 py-2 border rounded-md bg-white"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          placeholder={datePlaceholder}
        />
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Week Hours" value="120h 54m" />
        <StatCard label="On Time"     value="20"      />
        <StatCard label="Late"        value="5"       />
        <StatCard label="Absent"      value="10"      />
      </div>

      {/* Attendance & Leave Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Summary */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Attendance Summary</h2>
            <input
              type="month"
              className="px-3 py-1 border rounded bg-[#BA3C54] text-white"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>

          {/* Dua kolom: PieChart & Legend */}
          <div className="flex items-center">
            {/* PieChart full width di kolom 1 */}
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={attendanceData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="60%"
                    label
                  >
                    {attendanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend dengan margin besar di kolom 2 */}
            <div className="w-1/2 ml-16 space-y-4 text-sm">
              {attendanceData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCircle size={10} color={item.color} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leave Summary */}
        <div className="bg-white p-6 rounded shadow flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Leave Summary</h2>
            <input
              type="month"
              className="px-3 py-1 border rounded bg-[#BA3C54] text-white"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="border p-4 rounded-md">
            <p className="text-sm text-gray-600">Total Quota Annual Leave</p>
            <p className="text-2xl font-bold">12 Days</p>
            <button
              onClick={handleRequestLeave}
              className="text-blue-600 text-sm mt-2 hover:underline"
            >
              Request Leave →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <LeaveCard
              title="Taken"
              value="4 Days"
              onAction={handleSeeDetail}
              actionLabel="See Detail →"
            />
            <LeaveCard
              title="Remaining"
              value="6 Days"
              onAction={handleRequestLeave}
              actionLabel="Request Leave →"
            />
          </div>
        </div>
      </div>

      {/* Grafik Jam Kerja */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Your Work Hours</h2>
          <input
            type="week"
            className="px-3 py-1 border rounded bg-[#BA3C54] text-white"
            value={selectedWeek}
            onChange={e => setSelectedWeek(e.target.value)}
          />
        </div>
        <p className="text-2xl font-bold mb-4">120h 54m</p>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workHoursData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#1C3D5A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-gray-600">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function LeaveCard({
  title,
  value,
  onAction,
  actionLabel,
}: {
  title: string;
  value: string;
  onAction: () => void;
  actionLabel: string;
}) {
  return (
    <div className="border p-4 rounded-md">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-lg font-bold">{value}</p>
      <button
        onClick={onAction}
        className="text-blue-600 text-sm mt-2 hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  );
}
