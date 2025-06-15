"use client";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { addLetter } from "@/lib/services/letter";
import { error } from "console";
import { errorToJSON } from "next/dist/server/render";

type LetterUserProps = {
  mode: "add" | "edit";
  initialData?: any;
  onSubmit: (data: any) => void;
};

export default function AddLetterFormUserPage({
  mode,
  initialData,
  onSubmit,
}: LetterUserProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { setTitle } = usePageTitle();
  const [letterFormatId, setSelectedLetter] = useState("");
  const [user, setUser] = useState("");
  const [title, setTitleText] = useState("");

  const [date, setDate] = useState("");
  const [resignation_date, setResignationDate] = useState("");
  const [reason_resign, setResaonResign] = useState("");

  const [reason, setReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [currentDivision, setCurrentDivision] = useState("");
  const [requestedDivision, setrequestedDivision] = useState("");

  const [currentSalary, setCurrentSalary] = useState("");
  const [requestedSalary, setrequestedSalary] = useState("");

  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [returnToWorkDate, setReturnToWorkDate] = useState("");

  useEffect(() => {
    setTitle("Letter Management");
  }, [setTitle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!resignation_date.trim())
      newErrors.resignation_date = "Resignation date is required";
    if (!currentDivision.trim())
      newErrors.currentDivision = "Current division is required";
    if (!requestedDivision.trim())
      newErrors.requestedDivision = "Requested division is required";
    if (!currentSalary.trim())
      newErrors.currentSalary = "Current Salary is required";
    if (!requestedSalary.trim())
      newErrors.requestedSalary = "Requested Salary is required";
    if (!leaveStartDate.trim())
      newErrors.leaveStartDate = "Leave start date is required";
    if (!returnToWorkDate.trim()) newErrors.returnToWorkDate = "Return to work";

    if (!reason.trim()) {
      switch (letterFormatId) {
        case "1":
          newErrors.reason = "Reason for resign is required";
          break;
        case "2":
          newErrors.reason = "Reason for transfer is required";
          break;
        case "3":
          newErrors.reason = "Reason for salary change is required";
          break;
        case "4":
          newErrors.reason = "Reason for leave is required";
          break;
        default:
          newErrors.reason = "Reason is required";
      }
    }

    setErrors(newErrors);

    const formData = new FormData();
    formData.append("letter_format_id", letterFormatId);
    formData.append("user_id", user);
    // formData.append("resignation_date", date);
    formData.append("reason_resign", reason);
    formData.append("additional_notes", additionalNotes);
    formData.append("current_division", currentDivision);
    formData.append("requested_division", requestedDivision);
    formData.append("reason_transfer", reason);
    formData.append("reason_salary", reason);
    formData.append("leave_start", leaveStartDate);
    formData.append("return_to_work", returnToWorkDate);
    formData.append("reason_for_leave", reason);
    formData.append("is_sent", "true");
    formData.append("is_approval", "false");

    const parseOrNull = (value: string) => {
      const n = Number(value);
      return isNaN(n) ? null : n;
    };

    formData.append(
      "current_salary",
      parseOrNull(currentSalary)?.toString() || ""
    );
    formData.append(
      "requested_salary",
      parseOrNull(requestedSalary)?.toString() || ""
    );

    await addLetter(formData);

    const appendIfValue = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    };

    switch (letterFormatId) {
      case "1":
        appendIfValue("resignation_date", date);
        appendIfValue("reason_resign", reason);
        appendIfValue("additional_notes", additionalNotes);
        break;

      case "2":
        appendIfValue("current_division", currentDivision);
        appendIfValue("requested_division", requestedDivision);
        appendIfValue("reason_transfer", reason);
        break;

      case "3":
        appendIfValue("current_salary", currentSalary);
        appendIfValue("requested_salary", requestedSalary);
        appendIfValue("reason_salary", reason);
        break;

      case "4":
        appendIfValue("leave_start", leaveStartDate);
        appendIfValue("return_to_work", returnToWorkDate);
        appendIfValue("reason_for_leave", reason);
        break;

      default:
        console.warn("Unknown letter type");
    }

    try {
      const response = await addLetter(formData);
      console.log("Letter submitted:", response);
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-col md:flex-row w-full gap-6">
        {/* Left Section */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 flex flex-col gap-6">
          {/* Left Section */}
          <div className="bg-white shadow-lg rounded-md p-6 space-y-4">
            <label className="block text-lg font-semibold mb-2">
              Create Letter
            </label>

            <div>
              <label className="block mb-1 font-medium">Format of Letter</label>
              <select
                className="w-full border border-gray-300 px-4 py-2 rounded"
                value={letterFormatId}
                onChange={(e) => setSelectedLetter(e.target.value)}>
                <option value="">Choose the type</option>
                <option value="1">Resignation Letter</option>
                <option value="2">Transfer Request</option>
                <option value="3">Payroll Request</option>
                <option value="4">Permission Request</option>
              </select>
            </div>
            {/* Conditional Fields */}

            {/* Resignation */}
            {letterFormatId === "1" && (
              <>
                <div>
                  <label className="block mb-1 font-medium">
                    Official Resignation Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded"
                  />
                  {errors.resignation_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.resignation_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Reason for Resignation
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-2 rounded resize-none"
                  />
                  {errors.reason_resign && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reason_resign}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Additional Notes
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-2 rounded resize-none"
                  />
                </div>
              </>
            )}

            {/* Transfer Division */}
            {letterFormatId === "2" && (
              <>
                <div>
                  <label className="block mb-1 font-medium">
                    Requested Division
                  </label>
                  <select
                    value={requestedDivision}
                    onChange={(e) => setrequestedDivision(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded">
                    <option>Choose the division</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Human Resource</option>
                    <option>Production</option>
                  </select>
                </div>
                {errors.requestedDivision && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.requestedDivision}
                  </p>
                )}

                <div>
                  <label className="block mb-1 font-medium">
                    Current Division
                  </label>
                  <select
                    value={currentDivision}
                    onChange={(e) => setCurrentDivision(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-2 rounded">
                    <option>Choose the division</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Human Resource</option>
                    <option>Production</option>
                  </select>
                  {errors.currentDivision && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentDivision}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Reason for Division Transfer
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-2 rounded resize-none"
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                  )}
                </div>
              </>
            )}

            {/* Salary */}
            {letterFormatId === "3" && (
              <>
                <div>
                  <label className="block mb-1 font-medium">
                    Current Salary
                  </label>
                  <input
                    type="number"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(e.target.value)}
                    placeholder="Enter current salary"
                    className="w-full border px-3 py-2"
                  />
                  {errors.currentSalary && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.currentSalary}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    Requested Salary
                  </label>
                  <input
                    type="number"
                    value={requestedSalary}
                    onChange={(e) => setrequestedSalary(e.target.value)}
                    placeholder="Enter Requested salary"
                    className="w-full border px-3 py-2"
                  />
                  {errors.requestedSalary && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.requestedSalary}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Reason for Salary Request
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-2 rounded resize-none"
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                  )}
                </div>
              </>
            )}

            {/* Leave */}
            {letterFormatId === "4" && (
              <>
                <div>
                  <label className="block mb-1 font-medium">Leave Start</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)} // harus ini, bukan setDate
                    className="w-full border border-gray-300 px-4 py-2 rounded"
                  />
                  {errors.leaveStartDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.leaveStartDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Return to Work
                  </label>
                  <input
                    type="date"
                    value={returnToWorkDate}
                    onChange={(e) => setReturnToWorkDate(e.target.value)} // harus ini, bukan setDate
                    className="w-full border border-gray-300 px-4 py-2 rounded"
                  />
                  {errors.returnToWorkDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.returnToWorkDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Reason for Leave
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 px-4 py-2 rounded resize-none"
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                  )}
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Preview
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </div>
        </form>

        {/* Right Section */}
        <div className="bg-white shadow-lg rounded-md p-6 w-full md:w-1/2 flex flex-col">
          <label className="block text-lg font-semibold mb-2">Preview</label>
          <div className="border border-gray-300 rounded-md flex-1 min-h-[400px] flex items-center justify-center text-gray-400 text-xl">
            None
          </div>
        </div>
      </div>
    </div>
  );
}
