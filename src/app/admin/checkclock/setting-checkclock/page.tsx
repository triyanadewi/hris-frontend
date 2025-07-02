"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import TimeSettingModal from "@/components/modals/checkclock/TimeSettingModal";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import "leaflet/dist/leaflet.css";

interface TimeSetting {
  day: string;
  work_day: boolean;
  late_threshold: string;
  min_clock_in: string;
  max_clock_in: string;
  min_clock_out: string;
  max_clock_out: string;
}

interface Branch {
  id: number | null;
  name: string;
  branch_address: string;
  branch_phone: string;
  branch_phone_backup?: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  is_head_office?: boolean;
}

interface WorkSettings {
  id: number | null;
  times: TimeSetting[];
  latitude: string;
  longitude: string;
  radius: string;
  address?: string;
  branch_id?: number | null; // Add branch selection
}

interface ErrorType {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

const DEFAULT_TIMES: TimeSetting[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
].map((day) => ({
  day,
  work_day: true,
  late_threshold: "08:00",
  min_clock_in: "07:00",
  max_clock_in: "09:00",
  min_clock_out: "16:00",
  max_clock_out: "19:00",
}));

export default function SettingCheckclock() {
  const router = useRouter();
  const {
    showToast,
    showConfirmDialog,
    showLoadingSwal,
    showSuccessDialog,
    showErrorDialog,
    showWarningDialog,
    closeSwal,
  } = useSweetAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  
  const MyMap = dynamic(() => import("@/components/Map"), { ssr: false });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    id: null,
    times: DEFAULT_TIMES,
    latitude: "",
    longitude: "",
    radius: "",
    branch_id: null,
  });

  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // Fetch branches/head office data
  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/test-branches`
      );
      
      if (response.data && response.data.data) {
        // Add head office as first option
        const branchesWithHeadOffice = [
          {
            id: null, // Use null for head office
            name: "Head Office",
            branch_address: "Main Office Location",
            branch_phone: "",
            is_head_office: true,
          },
          ...response.data.data.map((branch: any) => ({
            ...branch,
            is_head_office: false,
          }))
        ];
        setBranches(branchesWithHeadOffice);
      }
    } catch (err: any) {
      console.error("Failed to fetch branches", err);
      // Create default head office option if fetch fails
      setBranches([
        {
          id: null,
          name: "Head Office",
          branch_address: "Main Office Location",
          branch_phone: "",
          is_head_office: true,
        }
      ]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchWorkSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/test-work-settings`
      );
      if (response.data.status === 200 && response.data.data) {
        const settings = response.data.data;
        
        // Handle if data is an array, take the first element
        const setting = Array.isArray(settings) ? settings[0] : settings;

        const mappedTimes: TimeSetting[] =
          setting?.times && setting.times.length > 0
            ? setting.times.map((t: any) => ({
                day: t.day,
                work_day: t.work_day ?? true,
                late_threshold:
                  t.clock_in_on_time_limit?.substring(0, 5) || "08:00",
                min_clock_in: t.clock_in_start?.substring(0, 5) || "07:00",
                max_clock_in: t.clock_in_end?.substring(0, 5) || "09:00",
                min_clock_out: t.clock_out_start?.substring(0, 5) || "16:00",
                max_clock_out: t.clock_out_end?.substring(0, 5) || "19:00",
              }))
            : DEFAULT_TIMES;

        setWorkSettings({
          id: setting?.id || null,
          latitude: setting?.latitude?.toString() || "",
          longitude: setting?.longitude?.toString() || "",
          radius: setting?.radius?.toString() || "",
          times: mappedTimes,
          address: setting?.location_name || "",
          branch_id: setting?.branch_id || null,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch work settings", err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        router.replace('/signin');
        return;
      }
      
      showErrorDialog(
        "Failed to Load",
        "Unable to load work settings. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchWorkSettings();
  }, []);

  // Handle branch selection change
  const handleBranchChange = (branchId: number | null) => {
    const selectedBranch = branches.find(branch => branch.id === branchId);
    
    if (selectedBranch) {
      setWorkSettings((prev) => ({
        ...prev,
        branch_id: branchId,
        // Auto-populate location if branch has coordinates
        latitude: selectedBranch.latitude || prev.latitude,
        longitude: selectedBranch.longitude || prev.longitude,
        address: selectedBranch.branch_address || prev.address,
      }));

      showToast(
        "info", 
        `Selected: ${selectedBranch.name}${selectedBranch.latitude ? ' (Location auto-filled)' : ''}`,
        3000
      );
    }
  };

  const handleTimeChange = (
    index: number,
    field: keyof TimeSetting,
    value: string
  ) => {
    setWorkSettings((prev) => {
      const updatedTimes = [...prev.times];
      updatedTimes[index] = { ...updatedTimes[index], [field]: value };
      return { ...prev, times: updatedTimes };
    });
  };

  const handleWorkDayChange = (index: number, value: boolean) => {
    setWorkSettings((prev) => {
      const updatedTimes = [...prev.times];
      updatedTimes[index] = { ...updatedTimes[index], work_day: value };
      return { ...prev, times: updatedTimes };
    });
  };

  const saveWorkSettings = async () => {
    // Validation
    if (workSettings.branch_id === undefined) {
      showErrorDialog(
        "Validation Error",
        "Please select a branch or head office before saving."
      );
      return;
    }

    if (!workSettings.latitude || !workSettings.longitude) {
      showErrorDialog(
        "Validation Error",
        "Please set the office location on the map before saving."
      );
      return;
    }

    if (!workSettings.radius || parseInt(workSettings.radius) < 1) {
      showErrorDialog(
        "Validation Error",
        "Please set a valid radius (minimum 1 meter)."
      );
      return;
    }

    const confirmResult = await showConfirmDialog(
      "Save Work Settings",
      "Are you sure you want to save these work settings? This will affect all employees.",
      "Yes, save it!"
    );

    if (!confirmResult.isConfirmed) {
      return;
    }

    setSettingsLoading(true);
    setError("");
    showLoadingSwal("Saving work settings...");

    const dataToSend = {
      id: workSettings.id,
      branch_id: workSettings.branch_id,
      latitude: parseFloat(workSettings.latitude),
      longitude: parseFloat(workSettings.longitude),
      radius: parseInt(workSettings.radius),
      location_name: workSettings.address || (workSettings.branch_id ? 
        branches.find(b => b.id === workSettings.branch_id)?.name : "Head Office"),
      address: workSettings.address,
      times: workSettings.times.map((time) => ({
        day: time.day,
        clock_in_start: time.min_clock_in,
        clock_in_end: time.max_clock_in,
        clock_in_on_time_limit: time.late_threshold,
        clock_out_start: time.min_clock_out,
        clock_out_end: time.max_clock_out,
        work_day: time.work_day,
      })),
    };

    try {
      let response;
      if (workSettings.id) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/test-work-settings/${workSettings.id}`,
          dataToSend
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/test-work-settings`,
          dataToSend
        );
      }

      if (response.data.status === 200) {
        setShowSettingsModal(false);
        closeSwal();

        await showSuccessDialog(
          "Settings Saved!",
          "Work settings have been saved successfully!"
        );

        router.push("/admin/checkclock");
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: any) {
      closeSwal();
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        router.replace('/signin');
        return;
      }
      
      setError(err.response?.data?.message || "Failed to save work settings");

      await showErrorDialog(
        "Save Failed",
        err.response?.data?.message ||
          "Failed to save work settings. Please try again."
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleMapPositionChange = (lat: number, lng: number) => {
    if (isEditingLocation) {
      setWorkSettings((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }));

      // AUTO-FETCH ADDRESS saat position berubah
      fetchAddressForCoordinates(lat, lng);
    }
  };

  const fetchAddressForCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id,en`,
        {
          headers: {
            "User-Agent": "HRIS-App/1.0",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setWorkSettings((prev) => ({
            ...prev,
            address: data.display_name,
          }));
          
          console.log("Address fetched for position change:", data.display_name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch address for coordinates:", error);
      // Fallback ke koordinat jika gagal
      setWorkSettings((prev) => ({
        ...prev,
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      }));
    }
  };

  const handleAddressChange = (address: string) => {
    setWorkSettings((prev) => ({
      ...prev,
      address: address,
    }));
  };

  const getOfficeCurrentLocation = () => {
    if (navigator.geolocation) {
      showLoadingSwal("Getting your current location...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setWorkSettings((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id,en`,
              {
                headers: {
                  "User-Agent": "HRIS-App/1.0",
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                setWorkSettings((prev) => ({
                  ...prev,
                  latitude: lat.toString(),
                  longitude: lng.toString(),
                  address: data.display_name,
                }));

                closeSwal();
                showToast(
                  "success",
                  "Current location and address set successfully!"
                );
                return;
              }
            }
          } catch (error) {
            console.error("Failed to get address:", error);
          }
          closeSwal();
          showToast("success", "Current location set successfully!");
        },
        (error) => {
          closeSwal();
          let errorMessage = "Unable to retrieve your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }

          showErrorDialog("Location Error", errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      showWarningDialog(
        "Not Supported",
        "Geolocation is not supported by this browser. Please enter coordinates manually."
      );
    }
  };

  const clearLocation = async () => {
    const confirmResult = await showConfirmDialog(
      "Clear Location",
      "Are you sure you want to clear the office location? This will remove all location data.",
      "Yes, clear it!",
      "Cancel",
      "warning"
    );

    if (confirmResult.isConfirmed) {
      setWorkSettings((prev) => ({
        ...prev,
        latitude: "",
        longitude: "",
        address: "",
      }));
      showToast("info", "Location cleared successfully!");
    }
  };

  const toggleEditLocation = () => {
    setIsEditingLocation(!isEditingLocation);
    if (!isEditingLocation) {
      showToast(
        "info",
        "Location editing enabled. Click on map to set new location.",
        4000
      );
    } else {
      showToast("success", "Location editing disabled.", 2000);
    }
  };

  // Get selected branch info
  const selectedBranch = branches.find(branch => branch.id === workSettings.branch_id);

  console.log("workSettings:", workSettings);
  console.log("workSettings.times:", workSettings.times);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Checkclock Settings</h2>

      {/* Branch/Head Office Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Office/Branch Selection</h3>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Office/Branch *
          </label>
          {loadingBranches ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading branches...</span>
            </div>
          ) : (
            <select
              value={workSettings.branch_id === null ? 'null' : workSettings.branch_id || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'null') {
                  handleBranchChange(null);
                } else if (value === '') {
                  // Do nothing, keep current selection
                } else {
                  handleBranchChange(parseInt(value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="">-- Select Office/Branch --</option>
              {branches.map((branch) => (
                <option key={branch.id || 'null'} value={branch.id === null ? 'null' : branch.id}>
                  {branch.is_head_office ? '🏢 ' : '🏬 '}
                  {branch.name}
                  {branch.is_head_office && ' (Head Office)'}
                </option>
              ))}
            </select>
          )}
          
          {/* Show selected branch info */}
          {selectedBranch && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 mt-0.5">
                  {selectedBranch.is_head_office ? '🏢' : '🏬'}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    {selectedBranch.name}
                    {selectedBranch.is_head_office && ' (Head Office)'}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    📍 {selectedBranch.branch_address}
                  </p>
                  {selectedBranch.branch_phone && (
                    <p className="text-sm text-blue-700">
                      📞 {selectedBranch.branch_phone}
                    </p>
                  )}
                  {selectedBranch.latitude && selectedBranch.longitude && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✅ Location coordinates available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold mb-4">
          Work Day and Time Settings
        </h3>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-xs rounded-md transition-colors"
        >
          Edit All Time
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0F3553] text-white">
              <th className="p-2 text-center"></th>
              <th className="p-2 text-left">Work Day</th>
              <th className="p-2">Late Threshold</th>
              <th className="p-2">Min Clock In</th>
              <th className="p-2">Max Clock In</th>
              <th className="p-2">Min Clock Out</th>
              <th className="p-2">Max Clock Out</th>
            </tr>
          </thead>
          <tbody>
            {workSettings.times.map((timeSetting, idx) => (
              <tr
                key={idx}
                className={timeSetting.work_day ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={timeSetting.work_day}
                    onChange={(e) => handleWorkDayChange(idx, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </td>
                <td className="p-2 font-medium">{timeSetting.day}</td>
                {[
                  "late_threshold",
                  "min_clock_in",
                  "max_clock_in",
                  "min_clock_out",
                  "max_clock_out",
                ].map((field) => (
                  <td className="p-2" key={field}>
                    <input
                      type="time"
                      className={`border w-full px-2 py-1 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 ${
                        !timeSetting.work_day
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white"
                      }`}
                      value={(timeSetting as any)[field]}
                      onChange={(e) =>
                        handleTimeChange(
                          idx,
                          field as keyof TimeSetting,
                          e.target.value
                        )
                      }
                      disabled={!timeSetting.work_day}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Office Location Settings */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Office Location Settings</h3>

        {/* Map Full Width */}
        <div className="w-full border rounded-lg overflow-hidden shadow-sm bg-white mb-6 relative z-10">
          <div className="flex justify-between items-center p-4 border-b bg-[#F9FAFB]">
            <h4 className="text-sm font-medium text-gray-700">
              Office Location Map
              {isEditingLocation && (
                <span className="ml-2 text-xs text-blue-600 font-normal">
                  (Editing Mode)
                </span>
              )}
              {selectedBranch && (
                <span className="ml-2 text-xs text-gray-600">
                  - {selectedBranch.name}
                </span>
              )}
            </h4>
            <button
              type="button"
              onClick={toggleEditLocation}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                isEditingLocation
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              {isEditingLocation ? "Stop Editing" : "Edit Location"}
            </button>
          </div>

          {workSettings.latitude && workSettings.longitude ? (
            <MyMap
              position={[
                parseFloat(workSettings.latitude) || -6.2088,
                parseFloat(workSettings.longitude) || 106.8456,
              ]}
              zoom={16}
              popupText={selectedBranch ? `${selectedBranch.name} Location` : "Office Location"}
              onPositionChange={handleMapPositionChange}
              onAddressChange={handleAddressChange}
              isEditing={isEditingLocation}
            />
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="mb-2 font-medium">No office location set</p>
                <p className="text-sm text-gray-400 mb-4">
                  {selectedBranch 
                    ? `Set location for ${selectedBranch.name}` 
                    : "Select a branch/office first, then set location"}
                </p>
                {selectedBranch && (
                  <button
                    onClick={getOfficeCurrentLocation}
                    className="px-4 py-2 bg-[#1E3A5F] text-white rounded-md hover:bg-[#222d3a] transition-colors"
                  >
                    📍 Set Current Location
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Instructions */}
          {isEditingLocation &&
            workSettings.latitude &&
            workSettings.longitude && (
              <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 border-t">
                💡 Use the search bar to find locations, click "Use current
                location" button, or click directly on the map to set office
                location for {selectedBranch?.name || 'selected office'}.
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getOfficeCurrentLocation}
            disabled={!selectedBranch}
            className={`px-4 py-2 text-sm border border-gray-300 rounded-md transition-colors ${
              selectedBranch 
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            📍 Use Current Location
          </button>
          <button
            type="button"
            onClick={clearLocation}
            disabled={!workSettings.latitude && !workSettings.longitude}
            className={`px-4 py-2 text-sm border border-gray-300 rounded-md transition-colors ${
              (workSettings.latitude || workSettings.longitude)
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
          >
            🗑️ Clear Location
          </button>
        </div>

        {/* Form Detail Address & Location */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detail Address
            {selectedBranch && (
              <span className="text-gray-500 text-xs ml-1">
                ({selectedBranch.name})
              </span>
            )}
          </label>
          <div className="relative">
            <textarea
              value={workSettings.address || ""}
              onChange={(e) =>
                setWorkSettings((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              rows={3}
              placeholder={
                selectedBranch 
                  ? `Address for ${selectedBranch.name} will automatically update when you click on the map or use 'Set Current Location'...`
                  : "Select a branch/office first..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-10"
              disabled={!selectedBranch}
            />
          </div>
        </div>

        {/* Coordinate Inputs with Real-time Sync Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
              Office Latitude
            </label>
            <input
              type="text"
              value={workSettings.latitude}
              onChange={(e) =>
                setWorkSettings((prev) => ({
                  ...prev,
                  latitude: e.target.value,
                }))
              }
              placeholder="e.g., -6.200000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={!selectedBranch}
            />
          </div>

          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-2">
              Office Longitude
            </label>
            <input
              type="text"
              value={workSettings.longitude}
              onChange={(e) =>
                setWorkSettings((prev) => ({
                  ...prev,
                  longitude: e.target.value,
                }))
              }
              placeholder="e.g., 106.816666"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={!selectedBranch}
            />
          </div>
        </div>

        {/* Radius Setting */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allowed Radius (meters)
          </label>
          <input
            type="number"
            value={workSettings.radius}
            onChange={(e) =>
              setWorkSettings((prev) => ({
                ...prev,
                radius: e.target.value,
              }))
            }
            placeholder="100"
            min="1"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={!selectedBranch}
          />
          <p className="text-xs text-gray-500 mt-1">
            Employees must be within this radius to clock in/out. Recommended:
            50-200 meters.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => router.push("/admin/checkclock")}
          className="px-6 py-2 bg-[#D9D9D9] text-[#595959] rounded-md hover:bg-[#b1b1b1] disabled:opacity-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={saveWorkSettings}
          className="px-6 py-2 bg-[#1E3A5F] text-white rounded-md hover:bg-[#2d4a66] disabled:opacity-50 transition-colors flex items-center gap-2"
          disabled={isSubmitting || settingsLoading}
        >
          {settingsLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>Save Settings</>
          )}
        </button>
      </div>

      {/* Modal */}
      {showSettingsModal && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/30" />
          <TimeSettingModal
            workSettings={workSettings}
            setWorkSettings={setWorkSettings}
            setShowSettingsModal={setShowSettingsModal}
            error={error}
          />
        </>
      )}
    </div>
  );
}