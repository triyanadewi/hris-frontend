"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:8000/api/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          password: "",
        });
        setProfilePhoto(data.profile_photo);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (photo) {
      formData.append("photo", photo);
    }

    await fetch("http://localhost:8000/api/profile/update", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    router.push("/admin/view-profile");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      {profilePhoto && (
        <img
          src={`http://localhost:8000/storage/photos/${profilePhoto}`}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-4 mx-auto"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First Name" className="w-full border p-2 rounded" />
        <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last Name" className="w-full border p-2 rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" />
        <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="Phone Number" className="w-full border p-2 rounded" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="New Password" type="password" className="w-full border p-2 rounded" />
        <input type="file" onChange={handleFileChange} className="w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </form>
    </div>
  );
}
