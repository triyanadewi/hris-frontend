import React, { useState } from "react";
import { MdSettings, MdClose } from "react-icons/md";

interface TimeSetting {
  min_clock_in: string;
  max_clock_in: string;
  min_clock_out: string;
  max_clock_out: string;
  late_threshold: string;
}

interface WorkSettings {
  id: number | null;
  times: {
    day: string;
    work_day: boolean;
    late_threshold: string;
    min_clock_in: string;
    max_clock_in: string;
    min_clock_out: string;
    max_clock_out: string;
  }[];
  latitude: string;
  longitude: string;
  radius: string;
  address?: string;
}

interface TimeSettingModalProps {
  workSettings: WorkSettings;
  setWorkSettings: React.Dispatch<React.SetStateAction<WorkSettings>>;
  setShowSettingsModal: (show: boolean) => void;
  error: string;
}

const TimeSettingModal: React.FC<TimeSettingModalProps> = ({
  workSettings,
  setWorkSettings,
  setShowSettingsModal,
  error,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil nilai default dari hari pertama
  const defaultTime = workSettings.times[0];

  const [bulkTimeSetting, setBulkTimeSetting] = useState<TimeSetting>({
    min_clock_in: defaultTime?.min_clock_in || "07:00",
    max_clock_in: defaultTime?.max_clock_in || "09:00",
    min_clock_out: defaultTime?.min_clock_out || "16:00",
    max_clock_out: defaultTime?.max_clock_out || "19:00",
    late_threshold: defaultTime?.late_threshold || "08:00",
  });

  const handleSaveFromModal = () => {
    setIsSubmitting(true);

    setWorkSettings((prev) => ({
      ...prev,
      times: prev.times.map((time) => ({
        ...time,
        late_threshold: bulkTimeSetting.late_threshold,
        min_clock_in: bulkTimeSetting.min_clock_in,
        max_clock_in: bulkTimeSetting.max_clock_in,
        min_clock_out: bulkTimeSetting.min_clock_out,
        max_clock_out: bulkTimeSetting.max_clock_out,
      })),
    }));

    setIsSubmitting(false);
    setShowSettingsModal(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Clock In Time</label>
                <input
                  type="time"
                  value={bulkTimeSetting.min_clock_in}
                  onChange={(e) => setBulkTimeSetting({ ...bulkTimeSetting, min_clock_in: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Clock In Time</label>
                <input
                  type="time"
                  value={bulkTimeSetting.max_clock_in}
                  onChange={(e) => setBulkTimeSetting({ ...bulkTimeSetting, max_clock_in: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Late Threshold */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Late Threshold</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Late Threshold Time</label>
              <input
                type="time"
                value={bulkTimeSetting.late_threshold}
                onChange={(e) => setBulkTimeSetting({ ...bulkTimeSetting, late_threshold: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Employees who clock in after this time will be marked as "Late"
              </p>
            </div>
          </div>

          {/* Clock Out Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Clock Out Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Clock Out Time</label>
                <input
                  type="time"
                  value={bulkTimeSetting.min_clock_out}
                  onChange={(e) => setBulkTimeSetting({ ...bulkTimeSetting, min_clock_out: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Clock Out Time</label>
                <input
                  type="time"
                  value={bulkTimeSetting.max_clock_out}
                  onChange={(e) => setBulkTimeSetting({ ...bulkTimeSetting, max_clock_out: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-8 px-6 pb-6">
          <button
            type="button"
            onClick={handleSaveFromModal}
            className="px-4 py-2 bg-[#1E3A5F] text-white rounded-md hover:bg-[#222d3a]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSettingModal;
