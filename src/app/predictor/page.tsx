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
    exam: "JEE Mains",
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
    container: { maxWidth: "1200px", margin: "0 auto", padding: "80px 40px" },
    hero: { borderLeft: "15px solid #000", paddingLeft: "40px", marginBottom: "80px" },
    title: { fontSize: "5rem", fontWeight: 900, lineHeight: 0.85, textTransform: "uppercase" as const, letterSpacing: "-0.05em", margin: "0 0 20px 0" },
    formCard: { border: "4px solid #000", padding: "60px", background: "#fff", marginBottom: "80px", position: "relative" as const },
    label: { display: "block", fontSize: "14px", fontWeight: 900, textTransform: "uppercase" as const, marginBottom: "10px" },
    input: { width: "100%", padding: "20px", border: "4px solid #000", fontSize: "18px", fontWeight: 700, marginBottom: "30px", outline: "none", boxSizing: "border-box" as const },
    button: { width: "100%", padding: "25px", background: "#000", color: "#fff", border: "none", fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const, cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px" },
    matchBadge: { position: "absolute" as const, top: "-20px", left: "30px", background: "#FACC15", padding: "10px 20px", border: "4px solid #000", fontWeight: 900, fontSize: "14px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Admission<br />Forecaster</h1>
        <p style={{ fontSize: "20px", fontWeight: 700, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Predictive Modeling // Placement Yield Analysis</p>
      </div>

      <div style={styles.formCard}>
        <div style={{ position: "absolute", top: "-25px", left: "40px", background: "#000", color: "#fff", padding: "10px 30px", border: "4px solid #000", fontWeight: 900 }}>PARAMETER_INPUT_PROTOCOL</div>
        <form onSubmit={handlePredict}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            <div>
              <label style={styles.label}>Academic_Assessment_Exam</label>
              <select style={styles.input} value={form.exam} onChange={e => setForm({...form, exam: e.target.value})}>
                <option>JEE Mains</option>
                <option>JEE Advanced</option>
                <option>BITSAT</option>
                <option>GATE</option>
                <option>MET</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Verified_National_Rank</label>
              <input type="number" placeholder="ENTER_RANK_VALUE" style={styles.input} onChange={e => setForm({...form, maxRank: e.target.value})} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            <div>
              <label style={styles.label}>Max_Capital_Outlay (₹)</label>
              <input type="number" placeholder="ENTER_BUDGET_CAP" style={styles.input} value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Preferred_Deployment_Region</label>
              <input type="text" placeholder="STATE_OR_CITY" style={styles.input} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "PROCESSING_ALGORITHM..." : "GENERATE_PREDICTIONS →"}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div style={styles.grid}>
          {results.map((c: any) => (
            <div key={c.id} style={{ border: "4px solid #000", padding: "40px", position: "relative" as const, background: "#fff" }}>
              <div style={styles.matchBadge}>{c.matchScore}% MATCH_PROBABILITY</div>
              <h3 style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase", margin: "20px 0 10px 0" }}>{c.name}</h3>
              <p style={{ fontWeight: 700, color: "#666", marginBottom: "30px" }}>LOC: {c.city}, {c.state}</p>
              
              <div style={{ padding: "20px", border: "3px solid #000", background: "#f8fafc", marginBottom: "30px" }}>
                <div style={{ fontSize: "12px", fontWeight: 900, color: "#999" }}>THRESHOLD_RANK</div>
                <div style={{ fontSize: "20px", fontWeight: 900 }}>#{c.rank}</div>
                <div style={{ fontSize: "12px", fontWeight: 900, color: "#138808", marginTop: "10px" }}>ANNUAL_FEES: ₹{c.fees.toLocaleString()}</div>
              </div>
              
              <Link href={`/college/${c.id}`} style={{ display: "block", background: "#000", color: "#fff", padding: "15px", textAlign: "center", textDecoration: "none", fontWeight: 900 }}>AUDIT_PROFILE</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
