import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { getEmployeesForCheckClock } from "@/lib/services/check-clocks";

export interface FilterData {
  month: number;
  year: number;
  startDate?: string;
  endDate?: string;
  positions: string[];
  statuses: string[];
}

interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  onApplyFilter: (filters: FilterData) => void;
}

export default function FilterAdminModal({ show, onClose, onApplyFilter }: FilterModalProps) {
  const [positions, setPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const statusOptions = [
    "On Time",
    "Late",
    "Annual Leave",
    "Sick Leave",
    "Absent",
  ];
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  
  const initialLimit = 4;

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [dateFilterMode, setDateFilterMode] = useState<'month' | 'range'>('month');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [showAllPositions, setShowAllPositions] = useState(false);
  const [showAllStatus, setShowAllStatus] = useState(false);

  // Helper function to format date to YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch positions from employees
  useEffect(() => {
    const fetchPositions = async () => {
      if (!show) return;
      
      setLoading(true);
      try {
        const employees = await getEmployeesForCheckClock();
        const uniquePositions = [...new Set(employees.map(emp => emp.position_name))].filter(Boolean);
        setPositions(uniquePositions);
      } catch (error) {
        console.error("Error fetching positions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [show]);

  const togglePosition = (pos: string) => {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  };

  const toggleStatus = (stat: string) => {
    setSelectedStatus((prev) =>
      prev.includes(stat) ? prev.filter((s) => s !== stat) : [...prev, stat]
    );
  };

  const resetFilter = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedStartDate("");
    setSelectedEndDate("");
    setDateFilterMode('month');
    setSelectedPositions([]);
    setSelectedStatus([]);
  };

  const applyFilter = () => {
    if (!isFilterSelected()) return; // Prevent apply if no filters selected
    
    const filters: FilterData = {
      month: dateFilterMode === 'month' ? selectedMonth : 0,
      year: dateFilterMode === 'month' ? selectedYear : 0,
      startDate: dateFilterMode === 'range' ? selectedStartDate : undefined,
      endDate: dateFilterMode === 'range' ? selectedEndDate : undefined,
      positions: selectedPositions,
      statuses: selectedStatus,
    };
    onApplyFilter(filters);
    onClose();
  };

  // Check if any filter is selected (different from default)
  const isFilterSelected = () => {
    const isMonthYearChanged = selectedMonth !== currentMonth || selectedYear !== currentYear;
    const isDateRangeSelected = dateFilterMode === 'range' && selectedStartDate && selectedEndDate;
    const hasPositions = selectedPositions.length > 0;
    const hasStatus = selectedStatus.length > 0;
    
    return isMonthYearChanged || isDateRangeSelected || hasPositions || hasStatus;
  };

  if (!show) return null;

  const displayedPositions = showAllPositions ? positions : positions.slice(0, initialLimit);
  const displayedStatus = showAllStatus ? statusOptions : statusOptions.slice(0, initialLimit);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-full max-w-md h-full bg-white shadow-lg overflow-y-auto p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">Filter Checkclock</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-500 transition-colors"
          >
            <MdClose />
          </button>
        </div>

        {/* Date Filter Options */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h3 className="font-semibold mb-2">Date Filter</h3>
          
          {/* Toggle between Month/Year and Date Range */}
          <div className="flex gap-2 mb-3">
            <button
              className={`px-3 py-2 text-sm rounded ${
                dateFilterMode === 'month' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setDateFilterMode('month')}
            >
              Month & Year
            </button>
            <button
              className={`px-3 py-2 text-sm rounded ${
                dateFilterMode === 'range' ? 'bg-[#1E3A5F] text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => setDateFilterMode('range')}
            >
              Date Range
            </button>
          </div>

          {dateFilterMode === 'month' ? (
            <div className="flex gap-3">
              <select 
                className="border rounded-md px-3 py-2 w-full"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
              <select 
                className="border rounded-md px-3 py-2 w-full"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={selectedStartDate}
                  onChange={(e) => setSelectedStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={selectedEndDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  min={selectedStartDate}
                />
              </div>
              
              {/* Quick Date Options */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const today = new Date();
                    const todayStr = formatDate(today);
                    setSelectedStartDate(todayStr);
                    setSelectedEndDate(todayStr);
                  }}
                >
                  Today
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = formatDate(yesterday);
                    setSelectedStartDate(yesterdayStr);
                    setSelectedEndDate(yesterdayStr);
                  }}
                >
                  Yesterday
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const today = new Date();
                    // Get Monday of current week (start of week)
                    const dayOfWeek = today.getDay();
                    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - daysToMonday);
                    
                    // Get Sunday of current week (end of week)
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    
                    setSelectedStartDate(formatDate(startOfWeek));
                    setSelectedEndDate(formatDate(endOfWeek));
                  }}
                >
                  This Week
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const today = new Date();
                    // First day of current month (day 1)
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    // Last day of current month
                    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    
                    setSelectedStartDate(formatDate(startOfMonth));
                    setSelectedEndDate(formatDate(endOfMonth));
                  }}
                >
                  This Month
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const today = new Date();
                    // First day of last month
                    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    // Last day of last month  
                    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    
                    setSelectedStartDate(formatDate(startOfLastMonth));
                    setSelectedEndDate(formatDate(endOfLastMonth));
                  }}
                >
                  Last Month
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const today = new Date();
                    const last7Days = new Date(today);
                    last7Days.setDate(today.getDate() - 6); // 7 days including today
                    
                    setSelectedStartDate(formatDate(last7Days));
                    setSelectedEndDate(formatDate(today));
                  }}
                >
                  Last 7 Days
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Month & Year */}
        <div className="mb-6 border-b border-gray-200 pb-6" style={{display: 'none'}}>
          <h3 className="font-semibold mb-2">Month & Year</h3>
          <div className="flex gap-3">
            <select 
              className="border rounded-md px-3 py-2 w-full"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select 
              className="border rounded-md px-3 py-2 w-full"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Position */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h3 className="font-semibold mb-2">Position</h3>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {displayedPositions.map((pos) => (
                  <button
                    key={pos}
                    className={`border rounded-md py-2 px-2 text-sm ${
                      selectedPositions.includes(pos)
                        ? "bg-[#1E3A5F] text-white"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => togglePosition(pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {positions.length > initialLimit && (
                <div
                  className="mt-3 text-sm text-gray-500 text-center cursor-pointer flex justify-center items-center gap-1"
                  onClick={() => setShowAllPositions(!showAllPositions)}
                >
                  {showAllPositions ? (
                        <span className="flex items-center gap-0.5">
                        See Less <FiChevronUp className="text-base" />
                        </span>
                    ) : (
                        <span className="flex items-center gap-0.5">
                        See More <FiChevronDown className="text-base" />
                        </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Status */}
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h3 className="font-semibold mb-2">Status</h3>            <div className="grid grid-cols-2 gap-3">
              {displayedStatus.map((stat) => (
                <button
                  key={stat}
                  className={`border rounded-md py-2 px-2 text-sm ${
                    selectedStatus.includes(stat) ? "bg-[#1E3A5F] text-white" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleStatus(stat)}
                >
                  {stat}
                </button>
              ))}
            </div>
          {statusOptions.length > initialLimit && (
            <div
              className="mt-3 text-sm text-gray-500 text-center cursor-pointer flex justify-center items-center gap-1"
              onClick={() => setShowAllStatus(!showAllStatus)}
            >
              {showAllStatus ? (
                    <span className="flex items-center gap-0.5">
                    See Less <FiChevronUp className="text-base" />
                    </span>
                ) : (
                    <span className="flex items-center gap-0.5">
                    See More <FiChevronDown className="text-base" />
                    </span>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-10 gap-3">
          <button
            className="bg-[#D9D9D9] text-[#595959] rounded-md hover:bg-[#b1b1b1] disabled:opacity-50 px-6 py-2 w-full"
            onClick={resetFilter}
          >
            Reset
          </button>
          <button 
            className="bg-[#1E3A5F] text-white rounded-md hover:bg-[#222d3a] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 w-full" 
            onClick={applyFilter}
            disabled={!isFilterSelected()}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
