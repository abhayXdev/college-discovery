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
  if (!college) return <p style={{ textAlign: "center", padding: "40px" }}>College not found.</p>;

  const detailStyles = {
    container: { maxWidth: "800px", margin: "40px auto", background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6" },
    title: { fontSize: "32px", fontWeight: 800, color: "#111827", marginBottom: "20px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" },
    statBox: { padding: "15px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" },
    label: { fontSize: "12px", color: "#6b7280", textTransform: "uppercase" as const, fontWeight: 600, letterSpacing: "0.05em" },
    value: { fontSize: "18px", color: "#111827", fontWeight: 700, marginTop: "4px" },
    scoreList: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "15px", padding: 0, listStyle: "none" }
  };

  return (
    <div style={detailStyles.container}>
      <h1 style={detailStyles.title}>{college.name || "Unnamed College"}</h1>
      
      <div style={detailStyles.grid}>
        <div style={detailStyles.statBox}>
          <div style={detailStyles.label}>Location</div>
          <div style={detailStyles.value}>{college.city || "N/A"}, {college.state || "N/A"}</div>
        </div>
        <div style={detailStyles.statBox}>
          <div style={detailStyles.label}>NIRF Rank</div>
          <div style={detailStyles.value}>#{college.rank ?? "N/A"}</div>
        </div>
        <div style={detailStyles.statBox}>
          <div style={detailStyles.label}>Annual Fees</div>
          <div style={detailStyles.value}>₹{typeof college.fees === "number" ? college.fees.toLocaleString() : "N/A"}</div>
        </div>
        <div style={detailStyles.statBox}>
          <div style={detailStyles.label}>Overall Score</div>
          <div style={detailStyles.value}>{college.score ?? "N/A"}</div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ width: "100%", padding: "14px", background: "#059669", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#047857"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#059669"}
      >
        {saving ? "Processing..." : "Save to Favorites"}
      </button>

      <h2 style={{ marginTop: "40px", fontSize: "20px", fontWeight: 700, color: "#111827", borderBottom: "2px solid #f3f4f6", paddingBottom: "10px", marginBottom: "20px" }}>
        NIRF Parameter Breakdown
      </h2>
      <ul style={detailStyles.scoreList}>
        {[
          { label: "TLR", val: college.tlr },
          { label: "RPC", val: college.rpc },
          { label: "GO", val: college.go },
          { label: "OI", val: college.oi },
          { label: "Perception", val: college.perception }
        ].map((item) => (
          <li key={item.label} style={detailStyles.statBox}>
            <div style={detailStyles.label}>{item.label}</div>
            <div style={detailStyles.value}>{item.val ?? "0.0"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

