"use client";
import { useState, useEffect, use } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
      alert("DATA_COMMITTED_TO_WATCHLIST");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "100px", fontSize: "32px", fontWeight: 900, textAlign: "center" }}>READING_RECORD...</div>;
  if (!college) return <div style={{ padding: "100px", fontSize: "32px", fontWeight: 900, textAlign: "center" }}>RECORD_NOT_FOUND</div>;

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" },
    hero: { border: "6px solid #000", padding: "60px", marginBottom: "40px", position: "relative" as const },
    title: { fontSize: "4rem", fontWeight: 900, textTransform: "uppercase" as const, lineHeight: 0.9, marginBottom: "20px" },
    rankBox: { position: "absolute" as const, top: "-30px", right: "60px", background: "#E11D48", color: "#fff", padding: "20px 40px", fontWeight: 900, fontSize: "24px", border: "4px solid #000" },
    tabGroup: { display: "flex", flexWrap: "wrap" as const, gap: "0", marginBottom: "40px", border: "4px solid #000" },
    tab: (active: boolean) => ({ flex: 1, padding: "20px", textAlign: "center" as const, cursor: "pointer", fontWeight: 900, fontSize: "16px", textTransform: "uppercase" as const, background: active ? "#000" : "#fff", color: active ? "#fff" : "#000", borderRight: "4px solid #000", transition: "none" }),
    content: { border: "4px solid #000", padding: "60px" },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px", background: "#000" },
    statBox: { padding: "40px", background: "#FACC15", textAlign: "center" as const },
    saveBtn: { background: "#000", color: "#fff", border: "none", padding: "20px 40px", fontWeight: 900, cursor: "pointer", fontSize: "18px", textTransform: "uppercase" as const }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.rankBox}>OFFICIAL_RANK: #{college.rank}</div>
        <h1 style={styles.title}>{college.name}</h1>
        <p style={{ fontSize: "24px", fontWeight: 700, color: "#666" }}>LOCATION: {college.city}, {college.state} // {college.rating} STAR_RATING</p>
        
        <div style={{ marginTop: "40px" }}>
          <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? "EXECUTING..." : "ADD_TO_COLLECTION"}
          </button>
        </div>
      </div>

      <div style={styles.tabGroup}>
        {["overview", "courses", "placements", "reviews"].map(tab => (
          <div key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab}
          </div>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "overview" && (
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "30px", textTransform: "uppercase" }}>Analysis_Report</h2>
            <p style={{ fontSize: "20px", lineHeight: 1.6, color: "#333", fontWeight: 600 }}>{college.overview}</p>
            
            <div style={{ marginTop: "60px", ...styles.statGrid }}>
              <div style={styles.statBox}>
                <div style={{ fontSize: "12px", fontWeight: 900 }}>PERFORMANCE_INDEX</div>
                <div style={{ fontSize: "42px", fontWeight: 900 }}>{college.score}</div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontSize: "12px", fontWeight: 900 }}>CAPITAL_OUTLAY</div>
                <div style={{ fontSize: "42px", fontWeight: 900 }}>₹{college.fees.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {college.courses?.map((c: any) => (
              <div key={c.id} style={{ border: "4px solid #000", padding: "30px", fontWeight: 900, fontSize: "18px", textTransform: "uppercase" }}>{c.name}</div>
            ))}
          </div>
        )}

        {activeTab === "placements" && (
          <div style={{ ...styles.statGrid }}>
            <div style={{ ...styles.statBox, background: "#138808", color: "#fff" }}>
              <div style={{ fontSize: "12px", fontWeight: 900 }}>MEDIAN_YIELD</div>
              <div style={{ fontSize: "42px", fontWeight: 900 }}>₹{(college.medianSalary / 100000).toFixed(1)} LPA</div>
            </div>
            <div style={{ ...styles.statBox, background: "#000", color: "#fff" }}>
              <div style={{ fontSize: "12px", fontWeight: 900 }}>PEAK_RESULT</div>
              <div style={{ fontSize: "42px", fontWeight: 900 }}>₹{(college.highestPackage / 10000000).toFixed(1)} CR</div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            {college.reviews?.map((r: any) => (
              <div key={r.id} style={{ borderBottom: "4px solid #000", padding: "30px 0" }}>
                <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "10px" }}>GRADE: {r.rating}/5</div>
                <p style={{ fontSize: "18px", fontWeight: 600 }}>{r.content}</p>
                <div style={{ fontSize: "12px", fontWeight: 900, color: "#999", marginTop: "20px" }}>AUDIT_BY: {r.user.email} // {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
