"use client";
import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";

type CheckclockRecord = {
  id: number;
  date: string;
  clockIn: string;
  clockOut: string;
  workHours: string;
  status: string;
  proof_of_attendance?: string | null;
  longitude?: string | null;
  latitude?: string | null;
  detail_address?: string | null;
  location?: string | null;
  approved?: boolean | null;
};

type AttendanceDetailModalProps = {
  showDetailModal: boolean;
  setShowDetailModal: (value: boolean) => void;
  selectedDetail: CheckclockRecord | null;
};

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  showDetailModal,
  setShowDetailModal,
  selectedDetail,
}) => {
  if (!showDetailModal || !selectedDetail) return null;

  const getApprovalLabel = () => {
    if (selectedDetail.approved === true) return "Approve";
    if (selectedDetail.approved === false) return "Rejected";
    return "Waiting Approval";
  };

  const getApprovalColor = () => {
    if (selectedDetail.approved === true) return "bg-green-100 text-green-700";
    if (selectedDetail.approved === false) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="w-full max-w-md h-full bg-white shadow-lg overflow-y-auto p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">Attendance Details</h2>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-2xl hover:text-red-500 transition-colors"
          >
            <MdClose />
          </button>
        </div>

        {/* Tanggal & Status */}
        <div className="border rounded-md p-3 mb-4 flex justify-between items-center">
          <div>
            <p className="text-sm">Monday</p>
            <p className="font-bold text-lg">{selectedDetail.date}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${getApprovalColor()}`}
          >
            {getApprovalLabel()}
          </span>
        </div>

        {/* Attendance Information */}
        <div className="border rounded-md p-4 mb-4">
          <h4 className="font-semibold mb-3">Attendance Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Clock In</p>
              <p className="font-medium">{selectedDetail.clockIn}</p>
            </div>
            <div>
              <p className="text-gray-500">Clock Out</p>
              <p className="font-medium">{selectedDetail.clockOut || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Work Hours</p>
              <p className="font-medium">{selectedDetail.workHours || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium">{selectedDetail.status}</p>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="border rounded-md p-4 mb-4">
          <h4 className="font-semibold mb-3">Location Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{selectedDetail.location || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Detail Address</p>
              <p className="font-medium">
                {selectedDetail.detail_address || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Latitude</p>
              <p className="font-medium">{selectedDetail.latitude || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Longitude</p>
              <p className="font-medium">{selectedDetail.longitude || "-"}</p>
            </div>
          </div>
        </div>

        {/* Proof of Attendance */}
        <div className="border rounded-md p-4">
          <h4 className="font-semibold mb-3">Proof of Attendance</h4>
          <div className="flex justify-between items-center px-3 py-2 border rounded-md">
            <span className="text-sm truncate">
              {selectedDetail.proof_of_attendance?.split("/").pop() ||
                "Proof file"}
            </span>
            <div className="flex items-center gap-3 text-lg text-gray-500">
              <button
                className="hover:text-blue-600 transition-colors"
                title="View proof"
              >
                <FaEye />
              </button>
              <button
                className="hover:text-green-600 transition-colors"
                title="Download proof"
              >
                <FiDownload />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailModal;
