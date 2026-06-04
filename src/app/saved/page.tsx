"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";
import Link from "next/link";

export default function SavedCollegesPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authHelper.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }

    apiRequest("/api/user/saved")
      .then((res) => setSaved(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Your Saved Colleges</h2>
      {saved.length === 0 ? <p>No colleges saved yet.</p> : (
        <div style={{ display: "grid", gap: "15px" }}>
          {saved.map((item: any) => (
            <div key={item.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "4px" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>{item.college.name}</h3>
              <p style={{ margin: "5px 0" }}>{item.college.city}, {item.college.state}</p>
              <Link href={`/college/${item.college.id}`} style={{ color: "#007bff", textDecoration: "none" }}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
