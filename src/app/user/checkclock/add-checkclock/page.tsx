'use client';
import React, { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import { useRouter } from "next/navigation";
import { FiCalendar } from "react-icons/fi";

export default function AddCheckclock() {
  const { setTitle } = usePageTitle();
  const router = useRouter();   

  useEffect(() => {
    setTitle("Checkclock");
  }, [setTitle]);

  const [selectedType, setSelectedType] = useState("");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Data submitted!");
  };

  const showDateRange = selectedType === 'Annual Leave' || selectedType === 'Sick Leave';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        setFileName(file.name);
        setProofUploaded(true);
      } else {
        alert("Only image files are allowed.");
        setProofUploaded(false);
        setFileName('');
        setSelectedFile(null);
      }
    };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedFile(file);
        setFileName(file.name);
        setProofUploaded(true);
      } else {
        alert("Only image files are allowed.");
        setProofUploaded(false);
        setFileName('');
        setSelectedFile(null);
      }
    };
  
    const handleUpload = () => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append("proof", selectedFile);
      console.log("File uploaded:", selectedFile);
  
      // Simulasi kirim ke backend:
      alert("File uploaded: " + selectedFile.name);
    };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">Add Checkclock</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* ========= KIRI ========= */}
        <div className="flex flex-col space-y-4">
          {/* Type of Attendance */}
          <div>
            <label className="block mb-1 font-medium">Type of Attendance</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="" disabled hidden>Choose Type of Attendance</option>
              <option>Clock In</option>
              <option>Clock Out</option>
              <option>Absent</option>
              <option>Annual Leave</option>
              <option>Sick Leave</option>
            </select>
          </div>

          {/* Show only if type is Annual or Sick Leave */}
          {showDateRange && (
            <div className="flex gap-4">
              {/* Start Date */}
              <div className="flex-1">
                <label className="block mb-1 font-medium">Start Date</label>
                <div className="flex items-center border rounded px-3 py-2">
                  <FiCalendar className="mr-2 text-xl" />
                  <input
                    type="date"
                    className="w-full outline-none"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex-1">
                <label className="block mb-1 font-medium">End Date</label>
                <div className="flex items-center border rounded px-3 py-2">
                  <FiCalendar className="mr-2 text-xl" />
                  <input
                    type="date"
                    className="w-full outline-none"
                    placeholder="select time"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload Proof */}
          <div>
            <label className="block mb-1 font-medium">Upload Proof of Attendance</label>
            <div
              className={`border-2 border-dashed rounded-md px-4 py-10 text-center cursor-pointer ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 text-gray-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              {fileName ? (
                <>
                  <p className="text-green-600 font-medium">Selected File:</p>
                  <p>{fileName}</p>
                </>
              ) : (
                <>
                  Drag & Drop here<br />or<br />Browse
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="proofInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleUpload}
              className="mt-2 w-full py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
              disabled={!proofUploaded}
            >
              Upload Now
            </button>
          </div>
        </div>

        {/* ========= KANAN ========= */}
        <div className="flex flex-col space-y-4">
          {/* Location */}
          <div>
            <label className="block mb-1 font-medium">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="" disabled hidden>Choose Location</option>
              <option>Office A</option>
              <option>Remote</option>
            </select>
          </div>

          {/* Map Placeholder */}
          <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-600">[Map Placeholder]</span>
          </div>

          {/* Detail Address */}
          <div>
            <label className="block mb-1 font-medium">Detail Address</label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="Kota Malang, Jawa Timur"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Lat */}
          <div>
            <label className="block mb-1 font-medium">Lat</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Lat Location"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Long */}
          <div>
            <label className="block mb-1 font-medium">Long</label>
            <input
              type="text"
              value={long}
              onChange={(e) => setLong(e.target.value)}
              placeholder="Long Location"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* ========= BUTTONS ========= */}
        <div className="col-span-2 flex justify-end space-x-3 mt-4">
          <button
            type="button"
            onClick={() => router.push("/user/checkclock")}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
