"use client";
import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { FaUserCircle, FaEye } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import dynamic from "next/dynamic";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { CheckClockRecord } from "@/lib/services/check-clocks";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet.css";

// Dynamic imports
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,    loading: () => (
      <div className="mapLoading">Loading map...</div>
    ),
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// Definisikan tipe props
type AttendanceDetailModalProps = {
  showDetailModal: boolean;
  setShowDetailModal: (value: boolean) => void;
  selectedDetail: CheckClockRecord | null;
  // getCurrentLocation: () => void;
};

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  showDetailModal,
  setShowDetailModal,
  selectedDetail,
  // getCurrentLocation,
}) => {
  const { showToast, showLoadingSwal, Swal } = useSweetAlert();

  // Fix Leaflet icons saat component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");

      // Fix untuk default icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
  }, []);

  // Handle view proof of attendance
  const handleViewProof = async () => {
    if (!selectedDetail?.proof_of_attendance) {
      showToast("warning", "No proof of attendance available");
      return;
    }

    showLoadingSwal("Loading proof of attendance...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.close();

      await Swal.fire({
        title: "Proof of Attendance",
        html: `
          <div style="text-align: center;">
            <img src="${selectedDetail.proof_of_attendance}" 
                 alt="Proof of Attendance" 
                 style="max-width: 100%; max-height: 400px; object-fit: contain; border-radius: 8px;" 
                 onerror="this.style.display='none'; this.nextSibling.style.display='block';" />
            <div style="display: none; padding: 20px; background: #f3f4f6; border-radius: 8px; margin-top: 10px;">
              <p style="margin: 0; font-size: 16px;">📄 File Preview Not Available</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
                ${selectedDetail.proof_of_attendance.split("/").pop()}
              </p>
            </div>
          </div>
        `,
        showCloseButton: true,
        showConfirmButton: false,
        width: "600px",
      });
    } catch (error) {
      Swal.close();
      showToast("error", "Failed to load proof of attendance");
    }
  };

  // Handle download proof of attendance
  const handleDownloadProof = async () => {
    if (!selectedDetail?.proof_of_attendance) {
      showToast("warning", "No proof of attendance available");
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Download Proof",
      text: "Do you want to download this proof of attendance?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, download!",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    showLoadingSwal("Downloading file...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const link = document.createElement("a");
      link.href = selectedDetail.proof_of_attendance;
      link.download = `proof_${selectedDetail.employee_name}_${selectedDetail.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.close();
      showToast("success", "File downloaded successfully!");
    } catch (error) {
      Swal.close();
      showToast("error", "Failed to download file");
    }
  };

  // Handle show location dengan Leaflet preview dan Google Maps external
  const handleShowLocation = async () => {
    if (!selectedDetail?.latitude || !selectedDetail?.longitude) {
      showToast("warning", "Location coordinates not available");
      return;
    }

    showLoadingSwal("Loading map...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const lat = parseFloat(selectedDetail.latitude);
      const lng = parseFloat(selectedDetail.longitude);

      Swal.close();

      const result = await Swal.fire({
        title: "Employee Location",
        html: `
          <div style="text-align: left; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong>Employee:</strong> ${
              selectedDetail.employee_name
            }</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${
              selectedDetail.date
            }</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${
              selectedDetail.detail_address || "Not available"
            }</p>
            <p style="margin: 5px 0;"><strong>Coordinates:</strong> ${lat}, ${lng}</p>
          </div>
          <div id="swal-map-container" style="height: 300px; width: 100%; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;"></div>
        `,
        showCancelButton: true,
        confirmButtonText: "🌎 Open in Google Maps",
        cancelButtonText: "Close",
        confirmButtonColor: "#4285F4",
        cancelButtonColor: "#6b7280",
        width: "700px",
        didOpen: () => {
          try {
            // Check if window is available (client-side)
            if (typeof window === "undefined") return;

            const L = require("leaflet");

            // Initialize Leaflet map dengan error handling
            const mapContainer = document.getElementById("swal-map-container");
            if (!mapContainer) {
              console.error("Map container not found");
              return;
            }

            // Fix icon path untuk Leaflet
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
              iconUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              iconRetinaUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            });

            const map = L.map("swal-map-container", {
              center: [lat, lng],
              zoom: 15,
              zoomControl: true,
              scrollWheelZoom: true,
              dragging: true,
              touchZoom: true,
              doubleClickZoom: true,
            });

            // Menggunakan OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              maxZoom: 19,
            }).addTo(map);

            // Tambahkan marker dengan popup
            const marker = L.marker([lat, lng]).addTo(map);
            marker
              .bindPopup(
                `
              <div style="min-width: 200px; font-family: inherit;">
                <strong style="color: #1f2937; font-size: 14px;">${
                  selectedDetail.employee_name
                }</strong><br/>
                <small style="color: #6b7280; display: block; margin-top: 2px;">${
                  selectedDetail.date
                }</small><br/>
                <small style="color: #6b7280; display: block; margin-top: 2px;">${
                  selectedDetail.detail_address || "No address available"
                }</small><br/>
                <small style="color: #9ca3af; font-family: monospace; margin-top: 4px; display: block;">
                  ${lat.toFixed(6)}, ${lng.toFixed(6)}
                </small>
              </div>
            `
              )
              .openPopup();

            // Resize map setelah container siap
            setTimeout(() => {
              map.invalidateSize();
            }, 100);
          } catch (error) {
            console.error("Error initializing Leaflet map:", error);
            const mapContainer = document.getElementById("swal-map-container");
            if (mapContainer) {
              mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6; color: #6b7280; flex-direction: column; border-radius: 8px;">
                  <div style="text-align: center;">
                    <p style="margin-bottom: 10px; font-size: 16px;">📍 Map preview not available</p>
                    <p style="font-size: 12px; color: #9ca3af;">Click "Open in Google Maps" to view location</p>
                    <div style="margin-top: 10px; padding: 8px; background: white; border-radius: 4px; font-family: monospace; font-size: 12px;">
                      ${lat}, ${lng}
                    </div>
                  </div>
                </div>
              `;
            }
          }
        },
      });

      if (result.isConfirmed) {
        // Buka Google Maps dengan koordinat dan label
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`;
        window.open(googleMapsUrl, "_blank");

        // Toast konfirmasi
        showToast("info", "Opening location in Google Maps...");
      }
    } catch (error) {
      Swal.close();
      console.error("Error loading map:", error);
      showToast("error", "Failed to load map");
    }
  };

  // Handle reverse geocoding untuk mendapatkan alamat dari koordinat
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return `${lat}, ${lng}`;
    }
  };

  // Conditional rendering untuk mencegah error
  if (!showDetailModal || !selectedDetail) return null;

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

        {/* Employee Info */}
        <div className="flex items-center mb-6 border p-4 rounded-md">
          <div>
            <h3 className="font-bold text-lg">
              {selectedDetail.employee_name}
            </h3>
            <p className="text-sm text-gray-600">{selectedDetail.position}</p>
          </div>
          <div className="ml-auto">
            <span
              className={`text-sm px-2 py-1 rounded-full ${
                selectedDetail.approved === true
                  ? "bg-green-100 text-green-700"
                  : selectedDetail.approved === false
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {selectedDetail.approved === true
                ? "Approved"
                : selectedDetail.approved === false
                ? "Rejected"
                : "Waiting Approval"}
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
              <p className="font-medium">{selectedDetail.clock_in || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Check Out</p>
              <p className="font-medium">{selectedDetail.clock_out || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Work Hours</p>
              <p className="font-medium">{selectedDetail.work_hours || "-"}</p>
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

          {/* Location Action Buttons */}
          <div className="mt-3 space-y-2">
            {selectedDetail.latitude && selectedDetail.longitude && (
              <button
                onClick={handleShowLocation}
                className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
              >
                🗺️ View on Map
              </button>
            )}
          </div>
        </div>

        {/* Proof of Attendance */}
        {selectedDetail.proof_of_attendance && (
          <div className="border rounded-md p-4 mb-4">
            <h4 className="font-semibold mb-3">Proof of Attendance</h4>
            <div className="flex justify-between items-center px-4 py-2 border rounded-md">
              <span className="text-sm truncate">
                {selectedDetail.proof_of_attendance.split("/").pop() ||
                  "Proof file"}
              </span>
              <div className="flex items-center gap-3 text-xl text-gray-500">
                <button
                  onClick={handleViewProof}
                  className="hover:text-blue-600 transition-colors"
                  title="View proof"
                >
                  <FaEye />
                </button>
                <button
                  onClick={handleDownloadProof}
                  className="hover:text-green-600 transition-colors"
                  title="Download proof"
                >
                  <FiDownload />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDetailModal;
