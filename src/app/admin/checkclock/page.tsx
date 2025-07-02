"use client";
import React, { useState, useEffect } from "react";
import {
  MdSearch,
  MdFilterList,
  MdAdd,
  MdCheck,
  MdClose,
  MdSettings,
} from "react-icons/md";
import { FaPlus, FaUserCircle, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { FiFilter, FiSearch, FiDownload } from "react-icons/fi";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import ApproveRejectModal from "@/components/modals/checkclock/ApproveRejectModal";
import AttendanceDetailModal from "@/components/modals/checkclock/AttendanceDetailModal";
import FilterUserModal, { FilterData } from "@/components/modals/checkclock/FilterModalProps";
import { getAllCheckClocks, getCheckClocksWithFilters, approveCheckClock, rejectCheckClock, exportCheckClocks, CheckClockRecord } from "@/lib/services/check-clocks";

interface ErrorType {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface ApiResponse {
  data: CheckClockRecord[];
  message: string;
  status: number;
}

export default function CheckclockPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CheckClockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<CheckClockRecord | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<CheckClockRecord | null>(
    null
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [modalMode, setModalMode] = useState<"approve" | "reject">("approve");
  const [isClient, setIsClient] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterData | null>(null);

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

  const handleApplyFilter = (filters: FilterData) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Re-fetch data when filters change
  useEffect(() => {
    if (isClient) {
      fetchRecords();
    }
  }, [activeFilters, isClient]);

  const openApproveModal = (record: CheckClockRecord) => {
    setSelectedRecord(record);
    setModalMode("approve");
    setShowModal(true);
  };

  const openRejectModal = (record: CheckClockRecord) => {
    setSelectedRecord(record);
    setModalMode("reject");
    setShowModal(true);
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      let checkclocks;
      if (activeFilters) {
        // Use filtered endpoint with specific filters
        if (activeFilters.startDate && activeFilters.endDate) {
          // Date range filter
          checkclocks = await getCheckClocksWithFilters({
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            positions: activeFilters.positions,
            statuses: activeFilters.statuses
          });
        } else {
          // Month/year filter
          checkclocks = await getCheckClocksWithFilters({
            month: activeFilters.month,
            year: activeFilters.year,
            positions: activeFilters.positions,
            statuses: activeFilters.statuses
          });
        }
      } else {
        // Default: show today's data
        checkclocks = await getAllCheckClocks();
      }
      setRecords(checkclocks);
    } catch (err: unknown) {
      const error = err as ErrorType;
      const errorMessage = error.response?.data?.message || "Failed to fetch records. Please check your connection and try again.";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((record) => {
    const searchLower = search.toLowerCase();
    const employeeName = record.employee_name?.toLowerCase() || "";
    const position =
      typeof record.position === "string" ? record.position.toLowerCase() : "";
    
    // Only apply search filter since date/position/status filtering is done on backend
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
      await approveCheckClock(selectedRecord.id);
      await fetchRecords();
      setShowModal(false);
    } catch (err) {
      const error = err as ErrorType;
      setError(error.response?.data?.message || "Failed to approve record");
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedRecord) return;
    try {
      await rejectCheckClock(selectedRecord.id);
      await fetchRecords();
      setShowModal(false);
    } catch (err) {
      const error = err as ErrorType;
      setError(error.response?.data?.message || "Failed to reject record");
    }
  };

  const handleApprove = (record: CheckClockRecord) => {
    setSelectedRecord(record);
    setModalMode("approve");
    setShowModal(true);
  };

  const handleReject = (record: CheckClockRecord) => {
    setSelectedRecord(record);
    setModalMode("reject");
    setShowModal(true);
  };

  const handleExport = async () => {
    try {
      let filters;
      if (activeFilters) {
        if (activeFilters.startDate && activeFilters.endDate) {
          // Date range filter
          filters = {
            startDate: activeFilters.startDate,
            endDate: activeFilters.endDate,
            positions: activeFilters.positions,
            statuses: activeFilters.statuses
          };
        } else {
          // Month/year filter
          filters = {
            month: activeFilters.month,
            year: activeFilters.year,
            positions: activeFilters.positions,
            statuses: activeFilters.statuses
          };
        }
      } else {
        // Default: use today's data for export
        const currentDate = new Date();
        filters = {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          positions: [],
          statuses: []
        };
      }
      
      const blob = await exportCheckClocks(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Generate filename based on filters
      let filename = "check_clocks";
      if (filters.startDate && filters.endDate) {
        filename += `_${filters.startDate}_to_${filters.endDate}`;
      } else if (filters.month && filters.year) {
        filename += `_${filters.year}-${filters.month.toString().padStart(2, '0')}`;
      }
      if (filters.positions && filters.positions.length > 0) {
        filename += `_${filters.positions.join('-').replace(/\s+/g, '_')}`;
      }
      filename += ".xlsx";
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export data");
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
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <MdClose className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError("")}
                className="text-red-400 hover:text-red-600"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Checkclock Overview</h2>
          {!activeFilters && (
            <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
              Today's Data
            </span>
          )}
          {activeFilters && (
            <span className="text-sm text-gray-600 bg-green-50 px-2 py-1 rounded">
              {activeFilters.startDate && activeFilters.endDate 
                ? activeFilters.startDate === activeFilters.endDate
                  ? `Date: ${new Date(activeFilters.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : `${new Date(activeFilters.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(activeFilters.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : `${new Date(activeFilters.year, activeFilters.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
              }
            </span>
          )}
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
          {/* Action Buttons */}
          <button 
            className={`flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm ${
              activeFilters ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]' : ''
            }`}
            onClick={() => setShowFilterModal(true)}
          >
            <FiFilter /> Filter
            {activeFilters && (
              <span className="ml-1 bg-white text-[#1E3A5F] rounded-full px-1 text-xs">
                {(activeFilters.positions.length + activeFilters.statuses.length) || 'ON'}
              </span>
            )}
          </button>
          {activeFilters && (
            <button
              onClick={() => {
                setActiveFilters(null);
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-red-50 text-sm text-red-600 border-red-300"
            >
              <MdClose /> Clear Filter
            </button>
          )}
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
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                Employee Name
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Position
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Date
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Clock In
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Clock Out
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Work Hours
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Approve
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Status
              </th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((record, index) => (
              <tr key={record.id || `record-${index}`}>
                <td className="px-4 py-2">{record.employee_name}</td>
                <td className="px-4 py-2 text-center">{record.position}</td>
                <td className="px-4 py-2 text-center">
                  {record.date ? new Date(record.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  {record.clock_in || "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  {record.clock_out || "-"}
                </td>
                <td className="px-4 py-2 text-center">
                  {record.work_hours || "-"}
                </td>
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
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs items-center ${
                      record.status === "On Time"
                        ? "bg-green-100 text-green-800"
                        : record.status === "Late"
                        ? "bg-yellow-100 text-yellow-800"
                        : record.status === "Absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
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

      {/* Modal Filter */}
      <FilterUserModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
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
