"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";

export default function PredictorPage() {
  const [form, setForm] = useState({
    budget: "",
    minRank: "1",
    maxRank: "1000",
    location: "",
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams(form);
      const res = await apiRequest(`/api/predict/advanced?${params.toString()}`);
      setResults(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: "900px", margin: "40px auto", padding: "0 20px" },
    formCard: { background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6", marginBottom: "40px" },
    inputGroup: { marginBottom: "20px" },
    label: { display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" },
    input: { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", outline: "none" },
    button: { width: "100%", padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "16px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
    resultCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column" as const },
    scoreBadge: { alignSelf: "flex-start", padding: "4px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: 700, marginBottom: "12px" },
  };

  return (
    <div style={styles.container}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827" }}>Admission Predictor</h1>
        <p style={{ color: "#6b7280" }}>Tell us your preferences and we'll calculate your admission chances.</p>
      </div>

      <div style={styles.formCard}>
        <form onSubmit={handlePredict}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Annual Budget (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 200000" 
                required 
                value={form.budget}
                onChange={e => setForm({...form, budget: e.target.value})}
                style={styles.input} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Preferred Location (Optional)</label>
              <input 
                type="text" 
                placeholder="City or State" 
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
                style={styles.input} 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Min Rank</label>
              <input 
                type="number" 
                value={form.minRank}
                onChange={e => setForm({...form, minRank: e.target.value})}
                style={styles.input} 
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Max Rank</label>
              <input 
                type="number" 
                value={form.maxRank}
                onChange={e => setForm({...form, maxRank: e.target.value})}
                style={styles.input} 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Calculating Chances..." : "Predict Best Matches"}
          </button>
        </form>
        {error && <p style={{ color: "#ef4444", marginTop: "15px", textAlign: "center" }}>{error}</p>}
      </div>

      {results.length > 0 && (
        <div>
          <h2 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: 700 }}>Recommended Matches</h2>
          <div style={styles.grid}>
            {results.map((c: any) => (
              <div key={c.id} style={styles.resultCard}>
                <div style={{ 
                  ...styles.scoreBadge, 
                  background: c.matchScore > 75 ? "#dcfce7" : "#fef9c3", 
                  color: c.matchScore > 75 ? "#166534" : "#854d0e" 
                }}>
                  {c.matchScore}/100 Match Score
                </div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{c.name}</h3>
                <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>{c.city}, {c.state}</p>
                
                <div style={{ marginTop: "auto", paddingTop: "15px" }}>
                  <div style={{ fontSize: "14px", color: "#374151" }}>Rank: <strong>#{c.rank}</strong></div>
                  <div style={{ fontSize: "14px", color: "#059669", fontWeight: 600 }}>Fees: ₹{c.fees?.toLocaleString()}</div>
                  <Link href={`/college/${c.id}`} style={{ display: "block", marginTop: "12px", color: "#3b82f6", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
