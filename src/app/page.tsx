"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";

export default function HomePage() {
  const [colleges, setColleges] = useState([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [loading, setLoading] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const abortControllerRef = typeof window !== "undefined" ? { current: new AbortController() } : { current: null };

  useEffect(() => {
    apiRequest("/api/colleges/recommendations").then(res => setRecommendations(res.data)).catch(console.error);
    const saved = JSON.parse(localStorage.getItem("compare_ids") || "[]");
    setSelectedForCompare(saved);
  }, []);

  useEffect(() => {
    if (search.length > 0 && search.length < 2) return;
    const timeout = setTimeout(() => fetchColleges(), 400);
    return () => clearTimeout(timeout);
  }, [search, city, sortBy]);

  const fetchColleges = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({ search, city, sortBy });
      const res = await apiRequest(`/api/colleges?${params.toString()}`, { signal: controller.signal });
      setColleges(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setColleges([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const toggleCompare = (id: string) => {
    let next: string[];
    if (selectedForCompare.includes(id)) {
      next = selectedForCompare.filter(i => i !== id);
    } else {
      if (selectedForCompare.length >= 3) return alert("SYSTEM_LIMIT: 3_UNITS");
      next = [...selectedForCompare, id];
    }
    setSelectedForCompare(next);
    localStorage.setItem("compare_ids", JSON.stringify(next));
  };

  const styles = {
    container: { maxWidth: "1400px", margin: "0 auto", padding: "80px 40px" },
    hero: { borderLeft: "15px solid #000", paddingLeft: "40px", marginBottom: "100px" },
    title: { fontSize: "6rem", fontWeight: 900, lineHeight: 0.85, textTransform: "uppercase" as const, letterSpacing: "-0.05em", margin: "0 0 20px 0" },
    subtitle: { fontSize: "24px", fontWeight: 800, color: "#000", textTransform: "uppercase" as const, letterSpacing: "0.1em" },
    searchEngine: { border: "4px solid #000", display: "flex", flexWrap: "wrap" as const, marginBottom: "80px", background: "#000" },
    input: { flex: 1, border: "none", padding: "25px 30px", fontSize: "20px", fontWeight: 800, outline: "none", background: "#fff", borderRight: "4px solid #000" },
    select: { border: "none", padding: "0 30px", fontSize: "16px", fontWeight: 900, outline: "none", background: "#FACC15", cursor: "pointer", textTransform: "uppercase" as const },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "40px" },
  };

  return (
    <div style={styles.container}>
      {selectedForCompare.length > 0 && (
        <div style={{ position: "fixed", bottom: "0", left: "0", width: "100%", background: "#E11D48", color: "#fff", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000, borderTop: "6px solid #000" }}>
          <span style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase" }}>Compare_Register: {selectedForCompare.length}/3</span>
          <Link href={`/compare?ids=${selectedForCompare.join(",")}`} style={{ background: "#000", color: "#fff", padding: "15px 40px", fontWeight: 900, textDecoration: "none", fontSize: "18px" }}>RUN_ANALYTICS →</Link>
        </div>
      )}

      <div style={styles.hero}>
        <h1 style={styles.title}>National<br />Academic_Index</h1>
        <p style={styles.subtitle}>Institutional performance audit // verified data system</p>
      </div>

      <div style={styles.searchEngine}>
        <input placeholder="ENTER_INSTITUTION_NAME" value={search} onChange={e => setSearch(e.target.value)} style={styles.input} />
        <input placeholder="REGION_ID" value={city} onChange={e => setCity(e.target.value)} style={styles.input} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.select}>
          <option value="rank">SORT_BY_RANK</option>
          <option value="fees">SORT_BY_FEES</option>
          <option value="score">SORT_BY_SCORE</option>
        </select>
      </div>

      {recommendations && !search && (
        <div style={{ marginBottom: "80px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "30px", textTransform: "uppercase", borderBottom: "4px solid #000", paddingBottom: "10px" }}>Priority_Ranked_Entities</h2>
          <div style={styles.grid}>
            {recommendations.topRated.map((c: any) => (
              <CollegeCard key={c.id} college={c} isSelected={selectedForCompare.includes(c.id)} onToggle={() => toggleCompare(c.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "30px", textTransform: "uppercase", borderBottom: "4px solid #000", paddingBottom: "10px" }}>Institutional_Database</h2>
        {loading ? (
          <div style={{ padding: "40px", fontSize: "24px", fontWeight: 900, background: "#000", color: "#fff", textAlign: "center" }}>FETCHING_RECORDS_STREAM...</div>
        ) : (
          <div style={styles.grid}>
            {colleges.map((c: any) => (
              <CollegeCard key={c.id} college={c} isSelected={selectedForCompare.includes(c.id)} onToggle={() => toggleCompare(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollegeCard({ college, isSelected, onToggle }: any) {
  return (
    <div style={{ 
      border: "4px solid #000", 
      background: isSelected ? "#FACC15" : "#fff", 
      padding: "0", 
      display: "flex", 
      flexDirection: "column",
      position: "relative"
    }}>
      <div style={{ background: "#000", color: "#fff", padding: "8px 20px", fontWeight: 900, fontSize: "12px", textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{college.state || "UNKNOWN"} // {college.rating} RATING_INDEX</span>
        {college.status === "DEMO" && <span style={{ background: "#FACC15", color: "#000", padding: "2px 8px", fontSize: "10px" }}>DEMO_DATA</span>}
        {college.status === "VERIFIED" && <span style={{ background: "#138808", color: "#fff", padding: "2px 8px", fontSize: "10px" }}>VERIFIED</span>}
      </div>
      
      <div style={{ padding: "30px" }}>
        <h3 style={{ fontSize: "24px", fontWeight: 900, textTransform: "uppercase", margin: "0 0 10px 0", lineHeight: 1.1 }}>{college.name}</h3>
        <p style={{ fontWeight: 700, color: "#000", margin: 0 }}>📍 {college.city}</p>
        
        <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", background: "#000", border: "2px solid #000" }}>
          <div style={{ padding: "15px", background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "#999" }}>FEE_STRUCTURE</div>
            <div style={{ fontSize: "18px", fontWeight: 900 }}>₹{(college.fees / 1000).toFixed(0)}K</div>
          </div>
          <div style={{ padding: "15px", background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "#999" }}>PLACEMENT_YIELD</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#138808" }}>₹{(college.medianSalary / 100000).toFixed(1)}L</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", display: "flex", borderTop: "4px solid #000" }}>
        <div style={{ flex: 1, padding: "20px", background: "#000", color: "#fff", fontWeight: 900, textAlign: "center", fontSize: "18px" }}>
          RANK #{college.rank}
        </div>
        <Link href={`/college/${college.id}`} style={{ flex: 1, padding: "20px", background: "#fff", color: "#000", fontWeight: 900, textAlign: "center", textDecoration: "none", borderLeft: "4px solid #000" }}>
          AUDIT_PROFILE →
        </Link>
      </div>

      <button 
        onClick={() => onToggle()} 
        style={{ 
          position: "absolute", 
          top: "-15px", 
          right: "20px", 
          padding: "8px 15px", 
          background: isSelected ? "#000" : "#E11D48", 
          color: "#fff", 
          border: "3px solid #000", 
          fontWeight: 900, 
          cursor: "pointer",
          fontSize: "12px"
        }}
      >
        {isSelected ? "REMOVE" : "ADD_TO_QUEUE"}
      </button>
    </div>
  );
}
