"use client";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { FileText, Eye } from "lucide-react";
import { MdClose } from "react-icons/md";
import {
  FiFilter,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
} from "react-icons/fi";
import { FaPlus, FaUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getEmployees, deleteEmployee } from "@/lib/services/employee";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface AchievementData {
  id?: number;
  file_path?: string;
  original_filename?: string;
  [key: string]: any;
}

type AvatarProps = {
  src?: string;
  alt: string;
};

function EmployeeAvatar({ src, alt }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/`;

  const fullSrc = src?.startsWith("http") ? src : `${baseUrl}${src}`;

  if (!src || imgError) {
    return (
      <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto border border-gray-300" />
    );
  }

  return (
    <img
      src={fullSrc}
      alt={alt}
      onError={() => setImgError(true)}
      className="w-20 h-20 rounded-full object-cover mx-auto border border-gray-300"
    />
  );
}

type AchievementType = {
  id?: number;
  file_path?: string;
  original_filename?: string;
};

type EmployeeType = {
  id: number;
  photo?: string;
  Gender: "Male" | "Female";
  PhoneNumber: string;
  Branch: string;
  Position: string;
  Division: string;
  Status: "Aktif" | "Non Aktif";
  FirstName: string;
  LastName: string;
  NIK: string;
  LastEducation: string;
  PlaceOfBirth: string;
  BirthDate: string;
  ContractType: string;
  Bank: string;
  BankAccountNumber: string;
  BankAccountHolderName: string;
  Address: string;
  Notes: string;
  Achievements: AchievementType[];
};

export default function EmployeeDatabasetPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [summary, setSummary] = useState({
    period: "",
    totalEmployees: 0,
    activeEmployees: 0,
    Branch: 0,
    Division: 0,
  });
  const [employees, setEmployees] = useState<EmployeeType[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalItems = employees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("are you sure to delete this employee?");
    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);
      fetchEmployees();
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };
  const [imgError, setImgError] = useState(false);
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter((emp) =>
    emp.FirstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      console.log("Raw API response:", res); // Debug: lihat struktur response

      // Cek berbagai kemungkinan struktur response
      let employeesData = [];

      if (Array.isArray(res)) {
        // Jika response langsung berupa array
        employeesData = res;
      } else if (res.data && Array.isArray(res.data)) {
        // Jika data ada di res.data
        employeesData = res.data;
      } else if (
        res.data &&
        res.data.employees &&
        Array.isArray(res.data.employees)
      ) {
        // Jika data ada di res.data.employees
        employeesData = res.data.employees;
      } else if (
        res.data &&
        res.data.employees &&
        Array.isArray(res.data.employees)
      ) {
        // Jika data ada di res.data.employees
        employeesData = res.data.employees;
      } else {
        console.error("Unexpected response structure:", res);
        // Set employeesData sebagai array kosong jika struktur tidak dikenali
        employeesData = [];
      }

      const employees = employeesData.map((emp: any) => {
        let achievements = [];

        // Handle berbagai format achievements dari backend
        if (emp.achievements) {
          if (Array.isArray(emp.achievements)) {
            achievements = emp.achievements;
          } else if (typeof emp.achievements === "string") {
            try {
              achievements = JSON.parse(emp.achievements);
            } catch (e) {
              console.warn(
                "Failed to parse achievements for employee:",
                emp.id,
                e
              );
              achievements = [];
            }
          } else if (typeof emp.achievements === "object") {
            achievements = [emp.achievements]; // Single object to array
          }
        }

        const validAchievements = achievements.filter(
          (achievement: any) =>
            achievement &&
            (achievement.file_path || achievement.original_filename)
        );

        return {
          ...emp,
          Achievements: validAchievements,
        };
      });

      const currentDate = new Date();

      const activeCount = employees.filter((emp: any) => {
        const status = String(emp.Status || "")
          .toLowerCase()
          .trim();
        return status === "aktif";
      }).length;

      const branchCount = new Set(employees.map((emp: any) => emp.Branch)).size;
      const divisionCount = new Set(employees.map((emp: any) => emp.Division))
        .size;

      const formattedPeriod = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      setEmployees(employees);
      setSummary((prev) => ({
        ...prev,
        period: formattedPeriod,
        totalEmployees: employees.length,
        activeEmployees: activeCount,
        Branch: branchCount,
        Division: divisionCount,
      }));

      console.log("Processed employees:", employees);
      employees.forEach((emp: any) => {
        if (emp.Achievements && emp.Achievements.length > 0) {
          console.log(
            `Employee ${emp.FirstName} has ${emp.Achievements.length} achievements:`,
            emp.Achievements
          );
        }
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      // Set state dengan data kosong jika terjadi error
      setEmployees([]);
      setSummary((prev) => ({
        ...prev,
        period: new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        totalEmployees: 0,
        activeEmployees: 0,
        Branch: 0,
        Division: 0,
      }));
    }
  };

  const handleExportToExcel = () => {
    const exportData = employees.map((emp) => ({
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      Gender: emp.Gender,
      PhoneNumber: emp.PhoneNumber,
      Branch: emp.Branch,
      Position: emp.Position,
      Division: emp.Division,
      Status: emp.Status,
      NIK: emp.NIK,
      LastEducation: emp.LastEducation,
      PlaceOfBirth: emp.PlaceOfBirth,
      BirthDate: emp.BirthDate,
      ContractType: emp.ContractType,
      Bank: emp.Bank,
      BankAccountNumber: emp.BankAccountNumber,
      BankAccountHolderName: emp.BankAccountHolderName,
      Address: emp.Address,
      Notes: emp.Notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const safePeriod = summary.period.replace(" ", "_"); // contoh: "May_2025"
    const fileName = `Employees_${safePeriod}.xlsx`;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, fileName);
  };

  function getOriginalFileName(achievement: AchievementType) {
    if (achievement.original_filename) {
      return achievement.original_filename;
    }

    if (achievement.file_path) {
      const fileName = achievement.file_path.split("/").pop();
      return fileName || "Unnamed Achievement";
    }

    return "Unnamed Achievement";
  }

  function getFileUrl(achievement: AchievementType) {
    if (!achievement.file_path) {
      console.warn("No file_path found for achievement:", achievement);
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";

    const cleanPath = achievement.file_path.startsWith("/")
      ? achievement.file_path.slice(1)
      : achievement.file_path;

    return `${baseUrl}/storage/${cleanPath}`;
  }

  useEffect(() => {
    setTitle("Employee Database");
    fetchEmployees();
  }, [setTitle]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Period", value: summary.period },
          { label: "Total Employee", value: summary.totalEmployees },
          { label: "Total Active Employees", value: summary.activeEmployees },
          { label: "Branch", value: summary.Branch },
          { label: "Division", value: summary.Division },
        ].map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500">{item.label}</h3>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Header + Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">All Employees Information</h2>
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex items-center border rounded-lg px-2 py-1 bg-white">
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search Employee"
                className="outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm"
            >
              <FiFilter /> Filter
            </button>
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-[#D9D9D9] text-sm"
            >
              <FiDownload /> Export
            </button>
            <button
              className="flex items-center gap-1 px-3 py-1 bg-[#BA3C54] text-white rounded-md text-sm hover:opacity-80"
              onClick={() =>
                router.push("/admin/employee-database/add-employee-database")
              }
            >
              <FaPlus /> Add Data
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="relative pt-6 overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-500">
            <thead className="bg-[#1E3A5F]">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  No.
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-white">
                  Photo Profile
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  Gender
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  Phone Number
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  Branch
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  Position
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-white">
                  Division
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-white text-center">
                  Status
                </th>
                <th className="px-4 py-2 text-sm font-semibold text-white text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee, index) => (
                <tr key={employee.id} className=" hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    <EmployeeAvatar
                      src={employee.photo}
                      alt={employee.FirstName}
                    />
                  </td>
                  <td className="px-4 py-2">
                    {employee.FirstName} {employee.LastName}
                  </td>
                  <td className="px-4 py-2">{employee.Gender}</td>
                  <td className="px-4 py-2">{employee.PhoneNumber}</td>
                  <td className="px-4 py-2">{employee.Branch}</td>
                  <td className="px-4 py-2">{employee.Position}</td>
                  <td className="px-4 py-2">{employee.Division}</td>
                  <td className="px-4 py-2 text-center">{employee.Status}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex h-full items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/employee-database/edit-employee-database/${employee.id}`
                          )
                        }
                        className="text-white bg-gray-600 px-2 py-2 rounded-md hover:opacity-70 text-xl"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-white bg-red-700 px-2 py-2 rounded-md hover:opacity-70 text-xl"
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        className="text-white bg-blue-700 px-2 py-2 rounded-md hover:opacity-70 text-xl"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowModal(true);
                        }}
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 text-sm">
          {/* Left: Items per page */}
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>

          {/* Middle: Showing x to y of z */}
          <div>
            Showing {startIndex + 1} to {endIndex} of {totalItems} records
          </div>

          {/* Right: Page Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === i + 1
                    ? "bg-gray-300"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>

        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
            <div className="w-full max-w-md h-full bg-white shadow-lg overflow-y-auto p-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold">Filtering Data</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>

              {/* Filter Sections */}
              <div className="space-y-6 text-sm">
                {/* Branch */}
                <div>
                  <h3 className="font-semibold mb-2">Branch</h3>
                  {/* {filterOptions.Branches.map((Branch) => {
                    const selected = selectedFilters.Branches.includes(Branch);
                    return (
                      <button
                        key={Branch}
                        onClick={() => toggleFilter("Branches", Branch)}
                        className={`border rounded-md py-1 px-2 text-center transition ${
                          selected
                            ? "bg-orange-200 font-semibold"
                            : "hover:bg-orange-100"
                        }`}>
                        {Branch}
                      </button>
                    );
                  })} */}
                </div>

                {/* Position */}
                <div>
                  <h3 className="font-semibold mb-2">Position</h3>
                  {/* {filterOptions.Positions.map((Position) => {
                    const selected =
                      selectedFilters.Positions.includes(Position);
                    return (
                      <button
                        key={Position}
                        onClick={() => toggleFilter("Positions", Position)}
                        className={`border rounded-md py-1 px-2 text-center transition ${
                          selected
                            ? "bg-orange-200 font-semibold"
                            : "hover:bg-orange-100"
                        }`}>
                        {Position}
                      </button>
                    );
                  })} */}
                </div>

                {/* Division */}
                <div>
                  <h3 className="font-semibold mb-2">Division</h3>
                  {/* {filterOptions.Divisions.map((Division) => {
                    const selected =
                      selectedFilters.Divisions.includes(Division);
                    return (
                      <button
                        key={Division}
                        onClick={() => toggleFilter("Divisions", Division)}
                        className={`border rounded-md py-1 px-2 text-center transition ${
                          selected
                            ? "bg-orange-200 font-semibold"
                            : "hover:bg-orange-100"
                        }`}>
                        {Division}
                      </button>
                    );
                  })} */}
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  {/* {filterOptions.Statuses.map((Status) => {
                    const selected = selectedFilters.Statuses.includes(Status);
                    return (
                      <button
                        key={Status}
                        onClick={() => toggleFilter("Statuses", Status)}
                        className={`border rounded-md py-1 px-2 text-center transition ${
                          selected
                            ? "bg-orange-200 font-semibold"
                            : "hover:bg-orange-100"
                        }`}>
                        {Status}
                      </button>
                    );
                  })} */}
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center mt-6">
                  <button className="text-sm text-gray-500 hover:underline">
                    Reset
                  </button>
                  {/* <button onClick={applyFilter} className="...">
                    Apply
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        )}

        {showModal && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
            <div className="w-full max-w-md h-full bg-white shadow-lg overflow-y-auto p-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold">Employee Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-2xl"
                >
                  <MdClose />
                </button>
              </div>

              {/* Employee Info */}
              <div className="flex items-center mb-6 border p-4 rounded-md">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <EmployeeAvatar
                    src={selectedEmployee.photo}
                    alt={selectedEmployee.FirstName}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{`${selectedEmployee.FirstName} ${selectedEmployee.LastName}`}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee.Position}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedEmployee.Division}
                  </p>
                </div>
              </div>

              {/* Personal Info */}
              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Place Of Birth</p>
                    <p className="font-medium">
                      {selectedEmployee.PlaceOfBirth}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date Of Birth</p>
                    <p className="font-medium">{selectedEmployee.BirthDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gender</p>
                    <p className="font-medium">{selectedEmployee.Gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">NIK</p>
                    <p className="font-medium">{selectedEmployee.NIK}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Last Education</p>
                    <p className="font-medium">
                      {selectedEmployee.LastEducation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-semibold mb-3">Bank Information</h4>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bank</p>
                    <p className="font-medium">{selectedEmployee.Bank}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Account Holder Name</p>
                    <p className="font-medium">
                      {selectedEmployee.BankAccountHolderName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Account Number</p>
                    <p className="font-medium">
                      {selectedEmployee.BankAccountNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-semibold mb-3">Additional Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Branch</p>
                    <p className="font-medium">{selectedEmployee.Branch}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contract Type</p>
                    <p className="font-medium">
                      {selectedEmployee.ContractType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-medium">{selectedEmployee.Status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="font-medium">{selectedEmployee.Address}</p>
                  </div>
                </div>
              </div>

              {/* Acievement */}
              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-semibold mb-3">
                  Achievements{" "}
                  {selectedEmployee?.Achievements?.length > 0 &&
                    `(${selectedEmployee.Achievements.length})`}
                </h4>

                {selectedEmployee?.Achievements &&
                selectedEmployee.Achievements.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEmployee.Achievements.map((achievement, index) => {
                      const fileName = getOriginalFileName(achievement);
                      const fileUrl = getFileUrl(achievement);

                      // Skip if no file path
                      if (!achievement.file_path) {
                        console.warn(
                          "Skipping achievement without file_path:",
                          achievement
                        );
                        return null;
                      }

                      // File icon function
                      const getFileIcon = (filename: string) => {
                        const extension = filename
                          .split(".")
                          .pop()
                          ?.toLowerCase();
                        return (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 ${
                              extension === "pdf"
                                ? "text-red-500"
                                : "text-blue-500"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        );
                      };

                      // Open file function with enhanced error handling
                      const openFile = () => {
                        if (!fileUrl) {
                          console.error(
                            "No file URL available for achievement:",
                            achievement
                          );
                          alert("File not available for viewing");
                          return;
                        }

                        try {
                          console.log("Opening file:", fileUrl);
                          window.open(fileUrl, "_blank", "noopener,noreferrer");
                        } catch (error) {
                          console.error("Error opening file:", error);
                          alert("Error occurred while trying to open the file");
                        }
                      };

                      return (
                        <div
                          key={achievement.id || `achievement-${index}`}
                          className="flex items-center justify-between border rounded-md p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getFileIcon(fileName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium text-gray-900 truncate"
                                title={fileName}
                              >
                                {fileName}
                              </p>
                              <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-0.5 rounded">
                                Saved
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={openFile}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="View file"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400 mx-auto mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500">No achievements available</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="border rounded-md p-4 mb-4">
                <h4 className="font-semibold mb-3">Notes</h4>
                {selectedEmployee.Notes &&
                selectedEmployee.Notes.trim() !== "" ? (
                  <p className="font-medium">{selectedEmployee.Notes}</p>
                ) : (
                  <p className="text-gray-500">No notes available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
