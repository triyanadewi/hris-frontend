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

interface WorkSettings {
  id: number | null;
  min_clock_in: string;
  max_clock_in: string;
  min_clock_out: string;
  max_clock_out: string;
  work_days_start: string;
  work_days_end: string;
  latitude: string;
  longitude: string;
  radius: string;
  late_threshold: string;
}

// Import Map component dynamically to avoid SSR issues
const MyMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>  
});

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
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    id: null,
    min_clock_in: "07:00",
    max_clock_in: "09:00",
    min_clock_out: "16:00",
    max_clock_out: "19:00",
    work_days_start: "monday",
    work_days_end: "friday",
    latitude: "",
    longitude: "",
    radius: "100",
    late_threshold: "08:00" 
  });

  const weekDays = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

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

  const saveWorkSettings = async () => {
      setSettingsLoading(true);
      setError(""); // Reset error

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const times = days.map(day => ({
          day,
          clock_in_start: workSettings.min_clock_in,
          clock_in_end: workSettings.max_clock_in,
          clock_in_on_time_limit: workSettings.late_threshold,
          clock_out_start: workSettings.min_clock_out,
          clock_out_end: workSettings.max_clock_out,
          work_day: true,
      }));

      const dataToSend = {
          id: workSettings.id,
          latitude: workSettings.latitude || null,
          longitude: workSettings.longitude || null,
          radius: parseInt(workSettings.radius) || 100,
          times
      };

      // console.log('Data yang dikirim ke API:', dataToSend);

      try {
          let response;
          
          // ✅ Gunakan PUT jika update (ada ID), POST jika create (tidak ada ID)
          if (workSettings.id) {
              response = await axios.put(`http://localhost:8000/api/work-settings/${workSettings.id}`, dataToSend);
          } else {
              response = await axios.post('http://localhost:8000/api/work-settings', dataToSend);
          }
          
          if (response.data.status === 200) {
              alert("Work settings saved successfully!");
              await fetchWorkSettings(); // Refresh data
              setShowSettingsModal(false); // Close modal jika ada
          } else {
              throw new Error(response.data.message);
          }
      } catch (err: any) {
          console.error("Save error:", err);
          console.error("Error response:", err.response?.data);
          setError(err.response?.data?.message || "Failed to save work settings");
      } finally {
          setSettingsLoading(false);
      }
  };

  // ✅ Perbaiki fetchWorkSettings juga
  const fetchWorkSettings = async () => {
      try {
          const response = await axios.get('http://localhost:8000/api/work-settings');
          // console.log("Work settings response:", response.data); // Debug
          
          if (response.data.status === 200 && response.data.data) {
              const setting = response.data.data;
              setWorkSettings({
                  id: setting.id,
                  latitude: setting.latitude || '',
                  longitude: setting.longitude || '',
                  radius: setting.radius?.toString() || '100',
                  min_clock_in: setting.times?.[0]?.clock_in_start?.substring(0, 5) || '07:00',
                  max_clock_in: setting.times?.[0]?.clock_in_end?.substring(0, 5) || '09:00',
                  late_threshold: setting.times?.[0]?.clock_in_on_time_limit?.substring(0, 5) || '08:00',
                  min_clock_out: setting.times?.[0]?.clock_out_start?.substring(0, 5) || '16:00',
                  max_clock_out: setting.times?.[0]?.clock_out_end?.substring(0, 5) || '19:00',
                  work_days_start: 'monday',
                  work_days_end: 'friday'
              });
          }
      } catch (err: any) {
          console.error("Failed to fetch work settings", err);
          console.error("Error response:", err.response?.data);
      }
  };

  useEffect(() => {
    setIsClient(true);
    fetchRecords();
    fetchWorkSettings();
  }, []);

  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const handleMapPositionChange = (lat: number, lng: number) => {
    if (isEditingLocation && !isNaN(lat) && !isNaN(lng)) {
      setWorkSettings(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    }
  };

  const getOfficeCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setWorkSettings(prev => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString()
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setWorkSettings(prev => ({
            ...prev,
            latitude: "-6.2088",
            longitude: "106.8456"
          }));
          alert("Could not get current location. Using default location (Jakarta).");
        }
      );
    } else {
      setWorkSettings(prev => ({
        ...prev,
        latitude: "-6.2088",
        longitude: "106.8456"
      }));
      alert("Geolocation is not supported. Using default location (Jakarta).");
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

  const handleEdit = (record: CheckclockRecord) => {
    router.push(`/admin/checkclock/${record.id}/edit`);
  };

  const handleDelete = async (record: CheckclockRecord) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`http://localhost:8000/api/checkclocks/${record.id}`);
        await fetchRecords();
      } catch (err) {
        setError("Failed to delete record");
      }
    }
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

  // Add this function before the return statement
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setWorkSettings(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get current location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Checkclock Overview</h2>
          <button
            onClick={() => setShowSettingsModal(true)}
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
          {/* <button className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm">
            <FiFilter /> Filter
          </button> */}
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
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Employee Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Position</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Clock In</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Clock Out</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Work Hours</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Approve</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-white">Status</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-white">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2">{record.employee_name}</td>
                <td className="px-4 py-2">{record.position}</td>
                <td className="px-4 py-2">{record.clock_in || '-'}</td>
                <td className="px-4 py-2">{record.clock_out || '-'}</td>
                <td className="px-4 py-2">{record.work_hours || '-'}</td>
                <td className="px-4 py-2 text-center">
                  {record.approved === null ? (
                    <span className="inline-flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(record)}
                        className="p-2 bg-green-500 rounded-md text-white hover:bg-green-600"
                      >
                        <MdCheck className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleReject(record)}
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
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded-md text-xs ${
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
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 text-yellow-600 hover:text-yellow-800"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(record)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>          
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center space-x-3">
                <MdSettings className="text-2xl text-gray-600" />
                <h3 className="text-xl font-semibold">Work Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Clock In Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Clock In Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Clock In Time
                    </label>
                    <input
                      type="time"
                      value={workSettings.min_clock_in}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        min_clock_in: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Clock In Time
                    </label>
                    <input
                      type="time"
                      value={workSettings.max_clock_in}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        max_clock_in: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Late Threshold Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Late Threshold Settings</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Threshold Time
                    </label>
                    <input
                      type="time"
                      value={workSettings.late_threshold}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        late_threshold: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Employees who clock in after this time will be marked as "Late"
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Clock Out Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Clock Out Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Clock Out Time
                    </label>
                    <input
                      type="time"
                      value={workSettings.min_clock_out}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        min_clock_out: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Clock Out Time
                    </label>
                    <input
                      type="time"
                      value={workSettings.max_clock_out}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        max_clock_out: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Work Days Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Work Days</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Days Start
                    </label>
                    <select
                      value={workSettings.work_days_start}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        work_days_start: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {weekDays.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Days End
                    </label>
                    <select
                      value={workSettings.work_days_end}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        work_days_end: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {weekDays.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Office Location Settings</h4>
                
                {/* Map Container */}
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Office Location Map</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingLocation(!isEditingLocation)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        isEditingLocation 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isEditingLocation ? 'Stop Editing' : 'Edit Location'}
                    </button>
                  </div>
                  
                  {isClient && workSettings.latitude && workSettings.longitude ? (
                    <MyMap
                      position={[
                        parseFloat(workSettings.latitude) || -6.2088,
                        parseFloat(workSettings.longitude) || 106.8456
                      ]}
                      zoom={16}
                      popupText="Office Location"
                      onPositionChange={isEditingLocation ? handleMapPositionChange : undefined}
                    />
                  ) : (
                    <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p className="mb-2">No location set</p>
                        <button
                          onClick={getOfficeCurrentLocation}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Set Current Location
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {isEditingLocation && workSettings.latitude && workSettings.longitude && (
                    <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 border-t">
                      💡 Click on the map to set office location, or drag the map to move the center point
                    </div>
                  )}
                </div>

                {/* Location Input Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office Latitude
                      </label>
                      <input
                        type="text"
                        value={workSettings.latitude}
                        onChange={(e) => {
                          setWorkSettings(prev => ({
                            ...prev,
                            latitude: e.target.value
                          }));
                        }}
                        placeholder="e.g., -6.200000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office Longitude
                      </label>
                      <input
                        type="text"
                        value={workSettings.longitude}
                        onChange={(e) => {
                          setWorkSettings(prev => ({
                            ...prev,
                            longitude: e.target.value
                          }));
                        }}
                        placeholder="e.g., 106.816666"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={getOfficeCurrentLocation}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      📍 Use Current Location
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkSettings(prev => ({
                          ...prev,
                          latitude: "",
                          longitude: ""
                        }));
                      }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Radius (meters)
                    </label>
                    <input
                      type="number"
                      value={workSettings.radius}
                      onChange={(e) => setWorkSettings(prev => ({
                        ...prev,
                        radius: e.target.value
                      }))}
                      placeholder="100"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Employees must be within this radius to clock in/out
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings Summary */}
              {/* Current Settings Preview */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Current Settings Summary:</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Clock In: {workSettings.min_clock_in} - {workSettings.max_clock_in}</p>
                  <p>Late Threshold: After {workSettings.late_threshold}</p>
                  <p>Clock Out: {workSettings.min_clock_out} - {workSettings.max_clock_out}</p>
                  <p>Work Days: {weekDays.find(d => d.value === workSettings.work_days_start)?.label} to {weekDays.find(d => d.value === workSettings.work_days_end)?.label}</p>
                  <p>Office Location: {workSettings.latitude && workSettings.longitude ? `${workSettings.latitude}, ${workSettings.longitude}` : 'Not set'}</p>
                  <p>Allowed Radius: {workSettings.radius} meters</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkSettings}
                disabled={settingsLoading}
                className="px-6 py-2 text-white bg-[#1C3D5A] rounded-md hover:bg-[#2A4D6B] disabled:opacity-50 disabled:cursor-not-allowed"              >
                {settingsLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Approve&Reject*/}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 space-y-8">
              {error && (
                <div className="text-red-500 text-sm">
                  {error}
                </div>
              )}
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaUserCircle className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold">Approve Attendance</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-8">
                  <div className="text-sm">
                      Are you sure you want to approve attendance for{" "}
                      <span className="font-semibold">{selectedRecord.employee_name}</span>?
                  </div>
                  <div className="flex justify-end gap-4">
                      <button
                          onClick={handleConfirmReject}
                          className="px-6 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                      >
                          Reject
                      </button>
                      <button
                          onClick={handleConfirmApprove}
                          className="px-6 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                      >
                          Approve
                      </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Details */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="w-full max-w-md h-full bg-white shadow-lg overflow-y-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold">Attendance Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-2xl">
                <MdClose />
              </button>
            </div>

            {/* Employee Info */}
            <div className="flex items-center mb-6 border p-4 rounded-md">
              <FaUserCircle className="text-3xl text-gray-500 mr-4" />
              <div>
                <h3 className="font-bold text-lg">{selectedDetail.employee_name}</h3>
                <p className="text-sm text-gray-600">{selectedDetail.position}</p>
              </div>
              <div className="ml-auto">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedDetail.approved === true ? "bg-green-100 text-green-700" :
                  selectedDetail.approved === false ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {selectedDetail.approved === true ? "Approved" :
                  selectedDetail.approved === false ? "Rejected" :
                  "Waiting Approval"}
                </span>
              </div>
            </div>

            {/* Attendance Info */}
            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-3">Attendance Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{selectedDetail.date}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check In</p>
                  <p className="font-medium">{selectedDetail.clock_in || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check Out</p>
                  <p className="font-medium">{selectedDetail.clock_out || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Work Hours</p>
                  <p className="font-medium">{selectedDetail.work_hours || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{selectedDetail.status}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-3">Location Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">{selectedDetail.location || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Detail Address</p>
                  <p className="font-medium">{selectedDetail.detail_address || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Latitude</p>
                  <p className="font-medium">{selectedDetail.latitude || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Longitude</p>
                  <p className="font-medium">{selectedDetail.longitude || '-'}</p>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="w-full mt-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-200"
                >
                  📍 Use Current Location
                </button>
              </div>
            </div>

            {/* Proof of Attendance */}
            {selectedDetail.proof_of_attendance && (
              <div className="border rounded-md p-4">
                <h4 className="font-semibold mb-3">Proof of Attendance</h4>
                <div className="flex justify-between items-center px-4 py-2 border rounded-md">
                  <span className="text-sm">{selectedDetail.proof_of_attendance}</span>
                  <div className="flex items-center gap-3 text-xl text-gray-500">
                    <button><FaEye /></button>
                    <button><FiDownload /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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