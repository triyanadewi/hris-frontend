"use client";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createEmployee, removeAchievement } from "@/lib/services/employee";
import AchievementForm from "@/components/Achievement";
import api from "@/lib/api";

type EmployeeFormProps = {
  mode: "add" | "edit";
  initialData?: any;
  onSubmit: (data: any) => void;
  employeeId?: string | number;
};

interface AchievementFile {
  id?: number;
  file?: File;
  url?: string;
  original_filename: string;
  isExisting?: boolean;
}

interface FileFromServer {
  id: number;
  name: string;
  url: string;
  original_filename?: string;
}

interface OptionItem {
  id: number;
  name: string;
  Branch_id?: number;
  Division_id?: number;
}
interface DropdownItem {
  id_posisi: number;
  nama_posisi: string;
  id_divisi: number;
  name_divisi: string;
  id_branch: number;
  name_branch: string;
}

function removeDuplicateFiles(files: File[]): File[] {
  const uniqueFiles: File[] = [];
  const fileMap = new Set<string>();

  files.forEach((file) => {
    const fileKey = `${file.name}_${file.size}_${file.type}`;
    if (!fileMap.has(fileKey)) {
      fileMap.add(fileKey);
      uniqueFiles.push(file);
    }
  });

  return uniqueFiles;
}

export default function EmployeeForm({
  mode,
  initialData,
  onSubmit,
  employeeId,
}: EmployeeFormProps) {
  const router = useRouter();
  const [dob, setDob] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [FirstName, setFirstName] = useState(initialData?.FirstName || "");
  const [PhoneNumber, setPhoneNumber] = useState(
    initialData?.PhoneNumber || ""
  );
  const [Gender, setGender] = useState(initialData?.Gender || "");
  const [PlaceOfBirth, setPlaceOfBirth] = useState(
    initialData?.PlaceOfBirth || ""
  );
  const [Position, setPosition] = useState(initialData?.Position_id || "");
  const [Division, setDivision] = useState(initialData?.Division_id || "");
  const [Branch, setBranch] = useState(initialData?.Branch_id || "");

  const [ContractType, setContractType] = useState(
    initialData?.ContractType || ""
  );
  const [Bank, setBank] = useState(initialData?.Bank || "");
  const [BankAccountHolderName, setBankAccountHolderName] = useState(
    initialData?.BankAccountHolderName || ""
  );
  const [LastName, setLastName] = useState(initialData?.LastName || "");
  const [NIK, setNIK] = useState(initialData?.NIK || "");
  const [LastEducation, setLastEducation] = useState(
    initialData?.LastEducation || ""
  );
  const [BankAccountNumber, setBankAccountNumber] = useState(
    initialData?.BankAccountNumber || ""
  );
  const [Address, setAddress] = useState(initialData?.Address || "");
  const [Status, setStatus] = useState(initialData?.Status || "");
  const [Notes, setNotes] = useState(initialData?.Notes || "");

  // Achievement states
  const [achievements, setAchievements] = useState<AchievementFile[]>([]);
  const [isEditMode, setIsEditMode] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [imageLoadError, setImageLoadError] = useState<string>("");

  // State untuk dropdown options
  const [branches, setBranches] = useState<OptionItem[]>([]);
  const [divisions, setDivisions] = useState<OptionItem[]>([]);
  const [positions, setPositions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // State untuk menyimpan semua data (untuk filtering)
  const [allDivisions, setAllDivisions] = useState<OptionItem[]>([]);
  const [allPositions, setAllPositions] = useState<OptionItem[]>([]);
  const allDivisionsRef = useRef<OptionItem[]>([]);
  const allPositionsRef = useRef<OptionItem[]>([]);

  useEffect(() => {
    setIsEditMode(mode === "edit");

    if (initialData) {
      setFirstName(initialData.FirstName || "");
      setPhoneNumber(initialData.PhoneNumber || "");
      setGender(initialData.Gender || "");
      setPlaceOfBirth(initialData.PlaceOfBirth || "");
      setPosition(initialData.Position_id?.toString() || "");
      setDivision(initialData.Division_id?.toString() || "");
      setBranch(initialData.Branch_id?.toString() || "");
      setContractType(initialData.ContractType || "");
      setBank(initialData.Bank || "");
      setBankAccountHolderName(initialData.BankAccountHolderName || "");
      setLastName(initialData.LastName || "");
      setNIK(initialData.NIK || "");
      setLastEducation(initialData.LastEducation || "");
      setBankAccountNumber(initialData.BankAccountNumber || "");
      setAddress(initialData.Address || "");
      setStatus(initialData.Status || "");
      setNotes(initialData.Notes || "");

      if (initialData?.photo_url) {
        console.log("Photo URL received:", initialData.photo_url);
        setPhotoUrl(initialData.photo_url);
      }

      if (initialData.BirthDate) {
        setDob(new Date(initialData.BirthDate));
      } else {
        setDob(null);
      }

      loadExistingAchievements(initialData);
    }

    fetchOptions();
  }, [initialData, mode]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/position-branch-company");
      const data = response.data as DropdownItem[];

      // Extract unique branches
      const uniqueBranches = Array.from(
        new Map(
          data.map((item: any) => [
            item.id_branch,
            {
              id: item.id_branch,
              name: item.name_branch,
            },
          ])
        ).values()
      );

      // Extract unique divisions
      const uniqueDivisions = Array.from(
        new Map(
          data.map((item: any) => [
            item.id_divisi,
            {
              id: item.id_divisi,
              name: item.name_divisi,
              Branch_id: item.id_branch,
            },
          ])
        ).values()
      );

      // Extract unique positions
      const uniquePositions = Array.from(
        new Map(
          data.map((item: any) => [
            item.id_posisi,
            {
              id: item.id_posisi,
              name: item.nama_posisi,
              Division_id: item.id_divisi,
            },
          ])
        ).values()
      );

      setBranches(uniqueBranches);
      setAllDivisions(uniqueDivisions);
      setAllPositions(uniquePositions);

      // Update refs for easy access
      allDivisionsRef.current = uniqueDivisions;
      allPositionsRef.current = uniquePositions;

      // Set initial divisions dan positions jika dalam edit mode
      if (initialData?.Branch_id) {
        updateDivisionsForBranch(initialData.Branch_id, uniqueDivisions);
        if (initialData?.Division_id) {
          updatePositionsForDivision(initialData.Division_id, uniquePositions);
        }
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk filter divisions berdasarkan branch
  const updateDivisionsForBranch = (
    BranchId: string | number,
    allDivisions?: any[]
  ) => {
    const divisionsToUse = allDivisions || allDivisionsRef.current;
    const filteredDivisions = divisionsToUse.filter(
      (div: any) => div.Branch_id == BranchId
    );
    setDivisions(filteredDivisions);
  };

  // Helper function untuk filter positions berdasarkan division
  const updatePositionsForDivision = (
    divisionId: string | number,
    allPositions?: any[]
  ) => {
    const positionsToUse = allPositions || allPositionsRef.current;
    const filteredPositions = positionsToUse.filter(
      (pos: any) => pos.Division_id == divisionId
    );
    setPositions(filteredPositions);
  };

  // Handle branch change
  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    setBranch(branchId);
    setDivision(""); // Reset division
    setPosition(""); // Reset position

    if (branchId) {
      updateDivisionsForBranch(branchId);
    } else {
      setDivisions([]);
    }
    setPositions([]);
  };

  // Handle division change
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divisionId = e.target.value;
    setDivision(divisionId);
    setPosition(""); // Reset position

    if (divisionId) {
      updatePositionsForDivision(divisionId);
    } else {
      setPositions([]);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load:", photoUrl);
    console.error("Error details:", e);
    setImageLoadError("Failed to load image: " + photoUrl);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", photoUrl);
    setImageLoadError("");
  };

  const loadExistingAchievements = (employeeData: any) => {
    if (employeeData.achievement_files) {
      const existingAchievements: AchievementFile[] =
        employeeData.achievement_files.map((file: any) => ({
          id: file.id,
          url: file.url,
          original_filename: file.name || file.original_filename,
          isExisting: true,
        }));
      setAchievements(existingAchievements);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: { [key: string]: string } = {};

    // Validation
    if (!FirstName.trim()) newErrors.FirstName = "First Name is required";
    if (!LastName.trim()) newErrors.LastName = "Last Name is required";

    if (!PhoneNumber.trim()) {
      newErrors.PhoneNumber = "Phone Number is required";
    } else if (!/^\d{12,}$/.test(PhoneNumber)) {
      newErrors.PhoneNumber = "Phone Number must be 12 digits and numeric";
    }

    if (!NIK.trim()) {
      newErrors.NIK = "NIK is required";
    } else if (!/^\d{16}$/.test(NIK)) {
      newErrors.NIK = "NIK must be 16 digits";
    }

    if (!Gender) newErrors.Gender = "Gender is required";
    if (!PlaceOfBirth) newErrors.PlaceOfBirth = "Place of Birth is required";
    if (!dob) newErrors.BirthDate = "Birth Date is required";
    if (!Position) newErrors.Position = "Position is required";
    if (!Division) newErrors.Division = "Division is required";
    if (!Status) newErrors.Status = "Status is required";
    if (!Branch) newErrors.Branch = "Branch is required";
    if (!ContractType) newErrors.ContractType = "Contract Type is required";
    if (!LastEducation) newErrors.LastEducation = "Last Education is required";
    if (!Bank) newErrors.Bank = "Bank is required";

    if (!BankAccountNumber.trim()) {
      newErrors.BankAccountNumber = "Bank Account Number is required";
    } else if (!/^\d+$/.test(BankAccountNumber)) {
      newErrors.BankAccountNumber = "Bank Account Number must be numeric";
    }

    if (!BankAccountHolderName)
      newErrors.BankAccountHolderName = "Account Holder Name is required";
    if (!Address || !Address.trim()) newErrors.Address = "Address is required";
    if (!photo && !photoUrl && mode === "add")
      newErrors.Photo = "Photo is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Hapus bagian FormData manual, gunakan onSubmit callback
      const formDataObject = {
        FirstName,
        LastName,
        PhoneNumber,
        NIK,
        Gender,
        PlaceOfBirth,
        Position_id: Position,
        Division_id: Division,
        Branch_id: Branch,
        ContractType,
        Bank,
        BankAccountHolderName,
        LastEducation,
        BankAccountNumber,
        Status,
        Address,
        Notes,
        BirthDate: dob,
        photo,
        Achievements: achievements
          .filter((a) => a.file && !a.isExisting)
          .map((a) => a.file),
      };
      await onSubmit(formDataObject);
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed photo change handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors((prev) => ({
          ...prev,
          Photo: "Only JPG, JPEG, PNG, and GIF files are allowed",
        }));
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          Photo: "File size must be less than 5MB",
        }));
        return;
      }

      setPhoto(selectedFile);
      setPhotoUrl(null);

      // Clear photo error if exists
      if (errors.Photo) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.Photo;
          return newErrors;
        });
      }
    }
  };

  // Function to remove photo
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoUrl(null);
    // Reset file input
    const fileInput = document.getElementById(
      "photo-input"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleDeleteAchievement = async (achievementId: number) => {
    try {
      await removeAchievement(achievementId);

      // Update local state - hapus achievement dari array
      setAchievements((prev) =>
        prev.filter((achievement) => achievement.id !== achievementId)
      );

      console.log("Achievement deleted successfully");
    } catch (error) {
      console.error("Failed to delete achievement:", error);
    }
  };

  const getOriginalFileName = (file: FileFromServer): string => {
    if (file.original_filename) return file.original_filename;

    const fileNameWithTimestamp = file.name;
    const parts = fileNameWithTimestamp.split("_");
    if (parts.length < 2) return fileNameWithTimestamp;

    const timestampPart = parts.pop();
    const timestampMatch = timestampPart?.match(/^(\d+)\.(\w+)$/);

    if (!timestampMatch) return fileNameWithTimestamp;

    const extension = timestampMatch[2];
    const originalName = parts.join("_");

    return `${originalName}.${extension}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <form onSubmit={handleSubmit}>
        {/* Photo */}
        <div className="md:col-span-2 flex items-start gap-6 mb-6">
          <div className="w-32 h-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border text-gray-400 text-sm">
            {photoUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={photoUrl}
                  alt="Employee Photo"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {imageLoadError && (
                  <div className="absolute inset-0 bg-red-100 flex items-center justify-center text-xs text-red-600 p-1">
                    Load Error
                  </div>
                )}
              </div>
            ) : photo ? (
              <img
                src={URL.createObjectURL(photo)}
                alt="Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              "No Photo"
            )}
          </div>
          <div className="flex flex-col justify-center h-32">
            <label className="block mb-1 font-medium">Photo Profile</label>

            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer text-sm inline-block">
              {mode === "edit" ? "Edit Photo" : "Upload Photo"}
              <input
                id="photo-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {errors.Photo && (
              <p className="text-red-500 text-sm mt-2">{errors.Photo}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col space-y-4">
            {/* FirstName */}
            <div>
              <label className="block mb-1 font-medium">First Name</label>
              <input
                type="text"
                value={FirstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter the first name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.FirstName && (
                <p className="text-red-500 text-sm mt-1">{errors.FirstName}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block mb-1 font-medium">Address</label>
              <input
                type="text"
                value={Address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.Address && (
                <p className="text-red-500 text-sm mt-1">{errors.Address}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-1 font-medium">Mobile Number</label>
              <input
                type="tel"
                value={PhoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter the mobile number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.PhoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.PhoneNumber}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 font-medium">Gender</label>
              <select
                value={Gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Choose Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
              {errors.Gender && (
                <p className="text-red-500 text-sm mt-1">{errors.Gender}</p>
              )}
            </div>

            {/* Place of Birth */}
            <div>
              <label className="block mb-1 font-medium">Place Of Birth</label>
              <input
                type="text"
                value={PlaceOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                placeholder="Enter the place of birth"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.PlaceOfBirth && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.PlaceOfBirth}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block mb-1 font-medium">Position</label>
              <select
                value={Position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || !Division}>
                <option value="">Choose the Position</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
              {errors.Position && (
                <p className="text-red-500 text-sm mt-1">{errors.Position}</p>
              )}
            </div>

            {/* Contract Type */}
            <div className="mt-4">
              <label className="block mb-1 font-medium">Contract Type</label>
              <RadioGroup
                name="contractType"
                value={ContractType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setContractType(e.target.value)
                }
                options={["Permanent", "Contract", "Freelance"]}
              />
              {errors.ContractType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ContractType}
                </p>
              )}
            </div>

            {/* Bank */}
            <div>
              <label className="block mb-1 font-medium">Bank</label>
              <select
                value={Bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Choose Bank</option>
                <option value="BCA">BCA</option>
                <option value="Mandiri">Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="BNI">BNI</option>
                <option value="BTN">BTN</option>
              </select>
              {errors.Bank && (
                <p className="text-red-500 text-sm mt-1">{errors.Bank}</p>
              )}
            </div>

            {/* Bank Account Holder Name */}
            <div>
              <label className="block mb-1 font-medium">
                Bank Account Holder Name
              </label>
              <input
                type="text"
                value={BankAccountHolderName}
                onChange={(e) => setBankAccountHolderName(e.target.value)}
                placeholder="Enter your bank account holder name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.BankAccountHolderName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.BankAccountHolderName}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col space-y-4">
            {/* LastName */}
            <div>
              <label className="block mb-1 font-medium">Last Name</label>
              <input
                type="text"
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.LastName && (
                <p className="text-red-500 text-sm mt-1">{errors.LastName}</p>
              )}
            </div>

            {/* NIK */}
            <div>
              <label className="block mb-1 font-medium">NIK</label>
              <input
                type="text"
                value={NIK}
                onChange={(e) => setNIK(e.target.value)}
                placeholder="Enter your NIK"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.NIK && (
                <p className="text-red-500 text-sm mt-1">{errors.NIK}</p>
              )}
            </div>

            {/* Last Education */}
            <div>
              <label className="block mb-1 font-medium">Last Education</label>
              <select
                value={LastEducation}
                onChange={(e) => setLastEducation(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Choose Last Education</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
              {errors.LastEducation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.LastEducation}
                </p>
              )}
            </div>

            {/* Date Of Birth */}
            <div>
              <label className="block mb-1 font-medium">Date Of Birth</label>
              <DatePicker
                selected={dob}
                onChange={(date) => setDob(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select your birth date"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={50}
                wrapperClassName="w-full"
              />
              {errors.BirthDate && (
                <p className="text-red-500 text-sm mt-1">{errors.BirthDate}</p>
              )}
            </div>

            {/* Branch */}
            <div>
              <label className="block mb-1 font-medium">Branch</label>
              <select
                value={Branch}
                onChange={handleBranchChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}>
                <option value="">Choose the Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.Branch && (
                <p className="text-red-500 text-sm mt-1">{errors.Branch}</p>
              )}
            </div>

            {/* Division */}
            <div>
              <label className="block mb-1 font-medium">Division</label>
              <select
                value={Division}
                onChange={handleDivisionChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || !Branch}>
                <option value="">Choose the Division</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
              {errors.Division && (
                <p className="text-red-500 text-sm mt-1">{errors.Division}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <select
                value={Status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Choose Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Non Aktif">Non Aktif</option>
              </select>
              {errors.Status && (
                <p className="text-red-500 text-sm mt-1">{errors.Status}</p>
              )}
            </div>

            {/* Bank Account Number */}
            <div>
              <label className="block mb-1 font-medium">
                Bank Account Number
              </label>
              <input
                type="text"
                value={BankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="Enter your bank account number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.BankAccountNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.BankAccountNumber}
                </p>
              )}
            </div>

            {/* Achievement */}
            <AchievementForm
              achievements={achievements}
              onAchievementsChange={setAchievements}
              isEditMode={isEditMode}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-5">
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            value={Notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter additional notes"
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={() => router.push("/admin/employee-database")}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
type RadioGroupProps = {
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function RadioGroup({ name, value, options, onChange }: RadioGroupProps) {
  return (
    <div>
      <div className="flex gap-x-10 mt-2">
        {options.map((opt: string) => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
