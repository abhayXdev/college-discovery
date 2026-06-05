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
    hero: { borderLeft: "15px solid #000", paddingLeft: "40px" },
    formCard: { border: "4px solid #000", background: "#fff", position: "relative" as const },
    label: { display: "block", fontSize: "14px", fontWeight: 900, textTransform: "uppercase" as const, marginBottom: "10px" },
    input: { width: "100%", padding: "20px", border: "4px solid #000", fontSize: "18px", fontWeight: 700, marginBottom: "30px", outline: "none", boxSizing: "border-box" as const },
    button: { padding: "25px", background: "#000", color: "#fff", border: "none", fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const, cursor: "pointer" },
    matchBadge: { position: "absolute" as const, top: "-20px", left: "30px", background: "#FACC15", padding: "10px 20px", border: "4px solid #000", fontWeight: 900, fontSize: "14px" }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:px-10 md:py-20">
      <div style={styles.hero} className="mb-10 md:mb-20">
        <h1 className="text-4xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-5">Admission<br />Forecaster</h1>
        <p className="text-sm md:text-xl font-bold text-gray-500 uppercase tracking-widest">Predictive Modeling // Placement Yield Analysis</p>
      </div>

      <div style={styles.formCard} className="p-8 md:p-16 mb-16 md:mb-24">
        <div style={{ position: "absolute", top: "-25px", left: "40px", background: "#000", color: "#fff", padding: "10px 30px", border: "4px solid #000", fontWeight: 900 }}>PARAMETER_INPUT_PROTOCOL</div>
        
        {error && (
          <div className="mb-8 p-5 bg-red-600 text-white font-black border-4 border-black text-sm md:text-base">
            ERROR_LOG: {error}
          </div>
        )}

        <form onSubmit={handlePredict}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-10">
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
              <input 
                type="number" 
                min="0"
                placeholder="ENTER_RANK_VALUE" 
                style={styles.input} 
                value={form.maxRank}
                onChange={e => setForm({...form, maxRank: e.target.value})} 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-10">
            <div>
              <label style={styles.label}>Max_Capital_Outlay (₹)</label>
              <input 
                type="number" 
                min="0"
                placeholder="ENTER_BUDGET_CAP" 
                style={styles.input} 
                value={form.budget} 
                onChange={e => setForm({...form, budget: e.target.value})} 
                required
              />
            </div>
            <div>
              <label style={styles.label}>Preferred_Deployment_Region</label>
              <input type="text" placeholder="STATE_OR_CITY" style={styles.input} value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.button} className="w-full md:w-auto">
            {loading ? "PROCESSING_ALGORITHM..." : "GENERATE_PREDICTIONS →"}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {results.map((c: any) => (
            <div key={c.id} style={{ border: "4px solid #000", padding: "40px", position: "relative" as const, background: "#fff" }}>
              <div style={styles.matchBadge}>{c.matchScore}% MATCH_PROBABILITY</div>
              <h3 className="text-2xl font-black uppercase mb-2 mt-5 leading-tight">{c.name}</h3>
              <p className="font-bold text-gray-500 mb-8 text-sm md:text-base">LOC: {c.city}, {c.state}</p>
              
              <div className="p-5 border-2 border-black bg-gray-50 mb-8">
                <div style={{ fontSize: "10px md:12px", fontWeight: 900, color: "#999" }}>THRESHOLD_RANK</div>
                <div className="text-lg md:text-2xl font-black">#{c.rank}</div>
                <div style={{ fontSize: "10px md:12px", fontWeight: 900, color: "#138808", marginTop: "10px" }}>ANNUAL_FEES: ₹{c.fees.toLocaleString()}</div>
              </div>
              
              <Link href={`/college/${c.id}`} style={{ display: "block", background: "#000", color: "#fff", padding: "15px", textAlign: "center", textDecoration: "none", fontWeight: 900 }}>AUDIT_PROFILE</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
