"use client";
import React, { useState } from "react";
import { MdSearch, MdFilterList, MdAdd, MdCheck, MdClose } from "react-icons/md";
import { FaPlus, FaUserCircle } from "react-icons/fa";
import {
  FiFilter,
  FiSearch,
  FiDownload,
} from "react-icons/fi";
import { useRouter } from "next/navigation";

interface CheckclockRecord {
  id: number;
  date: String;
  clockIn: string;
  clockOut: string;
  workHours: string;
  status: string;
}

export default function CheckclockPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [records] = useState<CheckclockRecord[]>([
    { id: 1, date: 'March 01, 2025', clockIn: '08.00', clockOut: '16.30', workHours: '10h 5m', status: 'On Time' },
    { id: 2, date: 'March 02, 2025', clockIn: '08.00', clockOut: '17.15', workHours: '9h 50m', status: 'On Time' },
    { id: 3, date: 'March 03, 2025', clockIn: '09.00', clockOut: '16.45', workHours: '10h 30m', status: 'On Time' },
    { id: 4, date: 'March 04, 2025', clockIn: '09.15', clockOut: '15.30', workHours: '6h 15m', status: 'Late' },
    { id: 5, date: 'March 05, 2025', clockIn: '—', clockOut: '—', workHours: '0', status: 'Annual Leave' },
    { id: 6, date: 'March 06, 2025', clockIn: '—', clockOut: '—', workHours: '0', status: 'Absent' },
    { id: 7, date: 'March 07, 2025', clockIn: '08.15', clockOut: '17.00', workHours: '9h 45m', status: 'On Time' },
    { id: 8, date: 'March 08, 2025', clockIn: '—', clockOut: '—', workHours: '0', status: 'Sick Leave' },
    { id: 9, date: 'March 09, 2025', clockIn: '08.00', clockOut: '16.00', workHours: '10h', status: 'Late' },
    { id: 10, date: 'March 10, 2025', clockIn: '08.30', clockOut: '16.00', workHours: '8h 30m', status: 'Late' },
    { id: 11, date: 'March 11, 2025', clockIn: '08.00', clockOut: '16.00', workHours: '8h', status: 'On Time' },
    { id: 12, date: 'March 12, 2025', clockIn: '08.00', clockOut: '16.30', workHours: '8h 30m', status: 'On Time' },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CheckclockRecord | null>(null);

  const filtered = records.filter((r) =>
    r.date.toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filtered.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Checklock Overview</h2>
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex items-center border rounded-lg px-2 py-1 bg-white">
            <FiSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search Employee"
              className="outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm">
            <FiFilter /> Filter
          </button>
          <button className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm">
            <FiDownload /> Export
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 bg-[#BA3C54] text-white rounded-md text-sm hover:opacity-90"
            onClick={() => router.push("/user/checkclock/add-checkclock")}
          >
            <FaPlus /> Add Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="pt-6 overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-500">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Clock In</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Clock Out</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Work Hours</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2">{r.date}</td>
                <td className="px-4 py-2">{r.clockIn}</td>
                <td className="px-4 py-2">{r.clockOut}</td>
                <td className="px-4 py-2">{r.workHours}</td>
                <td className="px-4 py-2">
                  <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-sm">
        {/* Left: Items per page */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        {/* Middle: Showing x to y of z */}
        <div>
          Showing {startIndex + 1} to {endIndex} of {totalItems} records
        </div>

        {/* Right: Page Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === i + 1
                  ? "bg-gray-300"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
