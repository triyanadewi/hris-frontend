"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdSearch, MdFilterList, MdAdd, MdCheck, MdClose, MdSettings } from "react-icons/md";
import { FaPlus, FaUserCircle, FaEdit, FaTrash, FaEye} from "react-icons/fa";
import {
  FiFilter,
  FiSearch,
  FiDownload,
} from "react-icons/fi";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import ApproveRejectModal from "@/components/modals/checkclock/ApproveRejectModal";
import AttendanceDetailModal from "@/components/modals/checkclock/AttendanceDetailModal";

interface ErrorType {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface CheckclockRecord {
  id: number;
  FirstName: string;
  LastName: string;
  employee_name: string;
  position: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  work_hours: string | null;
  approved: boolean | null;
  status: string;
  location: string | null;
  detail_address: string | null;
  latitude: string | null;
  longitude: string | null;
  proof_of_attendance: string | null;
}

interface ApiResponse {
  data: CheckclockRecord[];
  message: string;
  status: number;
}

export default function CheckclockPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CheckclockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CheckclockRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CheckclockRecord | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [modalMode, setModalMode] = useState<'approve' | 'reject'>('approve');
  
  // MISSING: useEffect untuk set isClient dan fetch data
  useEffect(() => {
    setIsClient(true);
  }, []);

  // MISSING: useEffect untuk fetch data saat component mount
  useEffect(() => {
    if (isClient) {
      fetchRecords();
    }
  }, [isClient]);
  
  const openApproveModal = (record: CheckclockRecord) => {
    setSelectedRecord(record);
    setModalMode('approve');
    setShowModal(true);
  };

  const openRejectModal = (record: CheckclockRecord) => {
    setSelectedRecord(record);
    setModalMode('reject');
    setShowModal(true);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/checkclocks');
      // console.log("Fetched records:", response);
      if (response.data.status === 200) {
        setRecords(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: unknown) {
      const error = err as ErrorType;
      setError(error.response?.data?.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(record => {
    const searchLower = search.toLowerCase();
    const employeeName = record.employee_name?.toLowerCase() || '';
    const position = typeof record.position === 'string' ? record.position.toLowerCase() : '';
    return employeeName.includes(searchLower) || position.includes(searchLower);
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filtered.slice(startIndex, endIndex);

  // Approve / Reject Handlers
  const handleConfirmApprove = async () => {
    if (!selectedRecord) return;
    try {
      await axios.put(`http://localhost:8000/api/checkclocks/${selectedRecord.id}`, {
        approved: true
      });
      // console.log("Record approved:", selectedRecord.id);
      await fetchRecords();
      setShowModal(false);
    } catch (err) {
      setError("Failed to approve record");
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRecord) return;
    try {
      await axios.put(`http://localhost:8000/api/checkclocks/${selectedRecord.id}`, {
        approved: false
      });
      await fetchRecords();
      setShowModal(false);
    } catch (err) {
      setError("Failed to reject record");
    }
  };

  const handleApprove = (record: CheckclockRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleReject = (record: CheckclockRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/checkclocks/export', {
        responseType: 'blob', // Penting agar file terunduh dengan benar
      });

      // Buat link download manual
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'check_clocks.xlsx'); // Nama file
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Checkclock Overview</h2>
          <button
            onClick={() => router.push("/admin/checkclock/setting-checkclock")}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            title="Work Settings"
          >
            <MdSettings className="text-xl" />
          </button>
        </div>
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
          <button 
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm"
          >
            <FiDownload /> Export
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 bg-[#BA3C54] text-white rounded-md text-sm hover:opacity-90"
            onClick={() => router.push("/admin/checkclock/add-checkclock")}
          >
            <FaPlus /> Add Data
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="pt-6 overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-500">
          <thead className="bg-[#1E3A5F]">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Employee Name</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Position</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Clock In</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Clock Out</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Work Hours</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Approve</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Status</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2">{record.employee_name}</td>
                <td className="px-4 py-2 text-center">{record.position}</td>
                <td className="px-4 py-2 text-center">{record.clock_in || '-'}</td>
                <td className="px-4 py-2 text-center">{record.clock_out || '-'}</td>
                <td className="px-4 py-2 text-center">{record.work_hours || '-'}</td>
                <td className="px-4 py-2 text-center">
                  {record.approved === null ? (
                    <span className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => openApproveModal(record)}
                        className="p-2 bg-green-500 rounded-md text-white hover:bg-green-600"
                      >
                        <MdCheck className="text-sm" />
                      </button>
                      <button
                        onClick={() => openRejectModal(record)}
                        className="p-2 bg-red-500 rounded-md text-white hover:bg-red-600"
                      >
                        <MdClose className="text-sm" />
                      </button>
                    </span>
                  ) : record.approved ? (
                    <button
                      disabled
                      className="p-2 bg-green-500 rounded-md text-white disabled:opacity-50"
                    >
                      <MdCheck className="text-sm" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="p-2 bg-red-500 rounded-md text-white disabled:opacity-50"
                    >
                      <MdClose className="text-sm" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded-md text-xs items-center ${
                    record.status === 'On Time' ? 'bg-green-100 text-green-800' :
                    record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </td>    
                <td className="px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDetail(record);
                        setShowDetailModal(true);
                      }}
                      className="px-4 py-1 bg-white text-black text-sm rounded-sm hover:bg-gray-200 border-1"
                      title="View Details"
                    >
                      View
                    </button>                  
                  </div>
                </td>          
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Approve&Reject*/}
      <ApproveRejectModal 
        showModal={showModal}
        setShowModal={setShowModal}
        selectedRecord={selectedRecord}
        handleConfirmApprove={handleConfirmApprove}
        handleConfirmReject={handleConfirmReject}
        mode={modalMode}
      />

      {/* Modal Details */}
      <AttendanceDetailModal 
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        selectedDetail={selectedDetail}
        // getCurrentLocation={getCurrentLocation}
      />

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1); // Reset to first page when changing items per page
        }}
      />
    </div>
  );
}