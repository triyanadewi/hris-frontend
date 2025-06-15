"use client";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";

export default function AddLetterManagementPage() {
  const { setTitle } = usePageTitle();
  const [selectedLetter, setSelectedLetter] = useState("");
  const [title, setTitleText] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setTitle("Letter Management");
  }, [setTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Data submitted!");
  };

return (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="flex flex-col md:flex-row w-full gap-6">
      
      {/* Left Section */}
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-1/2 flex flex-col gap-6"
      >
        {/* Upload Letter Card */}
        <div className="bg-white shadow-lg rounded-md p-6">
          <label className="block text-lg font-semibold mb-4">Upload Letter</label>
          <select
            value={selectedLetter}
            onChange={(e) => setSelectedLetter(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded"
          >
            <option value="">-Choose letter-</option>
            <option value="invitation">Invitation</option>
            <option value="notice">Notice</option>
          </select>
        </div>

        {/* Create Announcement Card */}
        <div className="bg-white shadow-lg rounded-md p-6 space-y-4">
          <label className="block text-lg font-semibold mb-2">Create Announcement</label>
          
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitleText(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 px-4 py-2 rounded resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Preview
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </form>

      {/* Right Section - Preview */}
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
