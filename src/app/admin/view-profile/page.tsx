"use client";

import { useEffect, useState } from "react";

export default function ViewProfile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  if (!profile) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {profile.profile_photo && (
        <img
          src={`http://localhost:8000/storage/photos/${profile.profile_photo}`}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover mb-4 mx-auto"
        />
      )}

      <p className="text-lg font-semibold">{profile.first_name} {profile.last_name}</p>
      <p className="text-gray-600">{profile.email}</p>
      <p className="text-gray-600">{profile.phone_number}</p>
    </div>
  );
}
