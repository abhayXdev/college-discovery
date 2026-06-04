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

  // Use a ref to track the current AbortController for in-flight requests
  const abortControllerRef = typeof window !== "undefined" ? { current: new AbortController() } : { current: null };

  // 1. Initial Load: Fetch Recommendations
  useEffect(() => {
    apiRequest("/api/colleges/recommendations").then(res => setRecommendations(res.data)).catch(console.error);
    const saved = JSON.parse(localStorage.getItem("compare_ids") || "[]");
    setSelectedForCompare(saved);
  }, []);

  // 2. Debounced Search Logic
  useEffect(() => {
    if (search.length > 0 && search.length < 2) return;
    const timeout = setTimeout(() => fetchColleges(), 400);
    return () => clearTimeout(timeout);
  }, [search, city, sortBy]);

  const fetchColleges = async () => {
    // Cancel previous request if still in flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({ search, city, sortBy });
      const res = await apiRequest(`/api/colleges?${params.toString()}`, {
        signal: controller.signal
      });
      setColleges(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      if (err.name === "AbortError") return; // Ignore cancellations
      setColleges([]);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const toggleCompare = (id: string) => {
    let next: string[];
    if (selectedForCompare.includes(id)) {
      next = selectedForCompare.filter(i => i !== id);
    } else {
      if (selectedForCompare.length >= 3) return alert("Select up to 3 colleges max");
      next = [...selectedForCompare, id];
    }
    setSelectedForCompare(next);
    localStorage.setItem("compare_ids", JSON.stringify(next));
  };

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" },
    section: { marginBottom: "60px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
    card: { background: "#fff", border: "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", transition: "all 0.2s ease", position: "relative" as const },
    input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", flex: 1, minWidth: "200px" },
    tag: { padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "#f0f7ff", color: "#007bff", fontWeight: 600 },
    compareBtn: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px" },
    skeleton: { background: "#f0f0f0", borderRadius: "12px", height: "180px", width: "100%", animate: "pulse 1.5s infinite" }
  };

  return (
    <div style={styles.container}>
      {/* Floating Compare Bar */}
      {selectedForCompare.length > 0 && (
        <div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", padding: "15px 30px", borderRadius: "50px", display: "flex", gap: "20px", alignItems: "center", zIndex: 1000, boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <span>{selectedForCompare.length} selected for comparison</span>
          <Link href={`/compare?ids=${selectedForCompare.join(",")}`} style={{ color: "#fff", fontWeight: 700, textDecoration: "underline" }}>Compare Now</Link>
          <button onClick={() => { setSelectedForCompare([]); localStorage.removeItem("compare_ids"); }} style={{ background: "none", border: "none", color: "#999", cursor: "pointer" }}>Clear</button>
        </div>
      )}

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: 800 }}>Explore Top Colleges</h1>
        <p style={{ color: "#666" }}>Live data from NIRF rankings with automated insights.</p>
      </div>

      {/* Recommendations */}
      {recommendations && search === "" && (
        <div style={styles.section}>
          <h2 style={{ marginBottom: "20px" }}>⭐ Recommended for You</h2>
          <div style={styles.grid}>
            {recommendations.topRated.map((c: any) => (
              <CollegeCard key={c.id} college={c} isSelected={selectedForCompare.includes(c.id)} onToggle={() => toggleCompare(c.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Search Controls */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px", background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
        <input placeholder="Search name..." value={search} onChange={e => setSearch(e.target.value)} style={styles.input} />
        <input placeholder="City..." value={city} onChange={e => setCity(e.target.value)} style={styles.input} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...styles.input, flex: 0, minWidth: "150px" }}>
          <option value="rank">Rank</option>
          <option value="fees">Fees</option>
          <option value="score">Score</option>
        </select>
      </div>

      {/* Search Results */}
      <div style={styles.section}>
        <h2 style={{ marginBottom: "20px" }}>{search ? `Search results for "${search}"` : "All Colleges"}</h2>
        {loading ? (
          <div style={styles.grid}>
            {[1,2,3].map(i => <div key={i} style={styles.skeleton} />)}
          </div>
        ) : (
          <div style={styles.grid}>
            {colleges.map((c: any) => (
              <CollegeCard key={c.id} college={c} isSelected={selectedForCompare.includes(c.id)} onToggle={() => toggleCompare(c.id)} />
            ))}
          </div>
        )}
        {!loading && colleges.length === 0 && <div style={{ textAlign: "center", padding: "50px", color: "#999" }}>No colleges found. Try a different search.</div>}
      </div>
    </div>
  );
}

function CollegeCard({ college, isSelected, onToggle }: any) {
  return (
    <div style={{ background: "#fff", border: isSelected ? "2px solid #007bff" : "1px solid #f0f0f0", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "#f0f7ff", color: "#007bff", fontWeight: 600 }}>{college.state || "N/A"}</span>
          <button onClick={onToggle} style={{ border: "1px solid #ddd", background: isSelected ? "#007bff" : "#fff", color: isSelected ? "#fff" : "#333", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", cursor: "pointer" }}>
            {isSelected ? "Selected" : "Select to Compare"}
          </button>
        </div>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>{college.name}</h3>
        <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{college.city}</p>
      </div>
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px", fontWeight: 600 }}>Rank #{college.rank ?? "N/A"}</span>
        <Link href={`/college/${college.id}`} style={{ fontSize: "14px", color: "#007bff", textDecoration: "none" }}>Details →</Link>
      </div>
    </div>
  );
}
