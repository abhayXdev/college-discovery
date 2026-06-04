"use client";
import { useState, useEffect, use } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest(`/api/colleges/${id}`)
      .then((res) => setCollege(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!authHelper.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/api/user/saved", {
        method: "POST",
        body: JSON.stringify({ collegeId: id }),
      });
      alert("College saved successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!college) return <p>College not found.</p>;

  return (
    <div>
      <h1>{college.name}</h1>
      <p><strong>Location:</strong> {college.city}, {college.state}</p>
      <p><strong>NIRF Rank:</strong> {college.rank}</p>
      <p><strong>Score:</strong> {college.score}</p>
      <p><strong>Annual Fees:</strong> ₹{college.fees}</p>
      
      <div style={{ marginTop: "20px", display: "flex", gap: "20px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", cursor: "pointer" }}
        >
          {saving ? "Saving..." : "Save College"}
        </button>
      </div>

      <h2 style={{ marginTop: "30px" }}>Detailed Scores</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>TLR: {college.tlr}</li>
        <li>RPC: {college.rpc}</li>
        <li>GO: {college.go}</li>
        <li>OI: {college.oi}</li>
        <li>Perception: {college.perception}</li>
      </ul>
    </div>
  );
}
