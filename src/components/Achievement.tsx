import React, { useState, useRef, useCallback } from "react";
import { X, Upload, FileText, Download, Eye } from "lucide-react";
import { removeAchievement as removeAchievementAPI } from "@/lib/services/employee";

interface AchievementFile {
  id?: number;
  file?: File;
  url?: string;
  original_filename: string;
  isExisting?: boolean;
}

interface AchievementProps {
  achievements: AchievementFile[];
  onAchievementsChange: (achievements: AchievementFile[]) => void;
  isEditMode?: boolean;
}

const Achievement: React.FC<AchievementProps> = ({
  achievements,
  onAchievementsChange,
  isEditMode = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    const newAchievements: AchievementFile[] = validFiles.map((file) => ({
      file,
      original_filename: file.name,
      isExisting: false,
    }));

    onAchievementsChange([...achievements, ...newAchievements]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Di components/Achievement.tsx, ganti bagian removeAchievement:

  const removeAchievement = async (index: number, achievementId?: number) => {
    if (isEditMode && achievementId && achievements[index].isExisting) {
      setRemovingIds((prev) => [...prev, achievementId]);

      try {
        // ✅ Gunakan service API yang konsisten
        await removeAchievementAPI(achievementId);

        const updatedAchievements = achievements.filter((_, i) => i !== index);
        onAchievementsChange(updatedAchievements);

        console.log("Achievement deleted successfully");
      } catch (error: any) {
        console.error("Error deleting achievement:", error);

        // Optional: Show error message to user
        if (error.response) {
          console.error("Error status:", error.response.status);
          console.error("Error data:", error.response.data);
        }
      } finally {
        setRemovingIds((prev) => prev.filter((id) => id !== achievementId));
      }
    } else {
      // Remove from local state (for new files or non-existing ones)
      const updatedAchievements = achievements.filter((_, i) => i !== index);
      onAchievementsChange(updatedAchievements);
    }
  };

  const openFile = (achievement: AchievementFile) => {
    if (achievement.url) {
      window.open(achievement.url, "_blank");
    } else if (achievement.file) {
      const url = URL.createObjectURL(achievement.file);
      window.open(url, "_blank");
      // Clean up the URL after opening
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Achievement Files
      </label>

      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, JPEG, PNG up to 5MB each
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({achievements.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeAchievement(index, achievement.id)}
                  disabled={
                    achievement.id
                      ? removingIds.includes(achievement.id)
                      : false
                  }
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors disabled:opacity-50">
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start space-x-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(achievement.original_filename)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {achievement.original_filename}
                    </p>

                    {achievement.file && (
                      <p className="text-xs text-gray-500">
                        {formatFileSize(achievement.file.size)}
                      </p>
                    )}

                    {achievement.isExisting && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                        Saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => openFile(achievement)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievement;
