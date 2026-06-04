"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";

export default function HomePage() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [loading, setLoading] = useState(false);

  // Live Search Logic: Debounce the search input to avoid hitting the API on every keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchColleges();
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [search, city, sortBy]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        city,
        sortBy,
      });
      const res = await apiRequest(`/api/colleges?${params.toString()}`);
      setColleges(res.data);
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modern Minimal Styles
  const styles = {
    container: {
      padding: "20px 0",
    },
    header: {
      marginBottom: "30px",
      textAlign: "center" as const,
    },
    searchSection: {
      display: "flex",
      gap: "15px",
      marginBottom: "40px",
      flexWrap: "wrap" as const,
      background: "#fff",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid #f0f0f0",
    },
    input: {
      flex: 1,
      minWidth: "200px",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    select: {
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "14px",
      background: "#fff",
      cursor: "pointer",
      outline: "none",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
    },
    card: {
      background: "#fff",
      border: "1px solid #eaeaea",
      borderRadius: "12px",
      padding: "20px",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      textDecoration: "none",
      color: "inherit",
      display: "block",
    },
    cardHover: {
      transform: "translateY(-4px)",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    tag: {
      display: "inline-block",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: 600,
      marginRight: "8px",
      background: "#e7f3ff",
      color: "#007bff",
    },
    rank: {
      color: "#666",
      fontSize: "14px",
      marginTop: "10px",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: "2.5rem", color: "#1a1a1a", marginBottom: "10px" }}>Discover Your Future</h1>
        <p style={{ color: "#666" }}>Explore and compare top colleges across the country.</p>
      </div>

      <div style={styles.searchSection}>
        <input
          placeholder="Search college by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Filter by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          style={styles.select}
        >
          <option value="rank">Sort by NIRF Rank</option>
          <option value="fees">Sort by Annual Fees</option>
          <option value="score">Sort by NIRF Score</option>
        </select>
      </div>

      {loading && <p style={{ textAlign: "center", color: "#007bff" }}>Updating results...</p>}

      <div style={styles.grid}>
        {!loading && colleges.map((college: any) => (
          <Link 
            href={`/college/${college.id}`} 
            key={college.id} 
            style={styles.card}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, styles.cardHover);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <span style={styles.tag}>{college.state}</span>
            </div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#111" }}>{college.name}</h3>
            <p style={{ margin: "0", color: "#555", fontSize: "14px" }}>{college.city}</p>
            
            <div style={styles.rank}>
              <strong>NIRF Rank: #{college.rank}</strong>
              <div style={{ marginTop: "5px", color: "#28a745", fontWeight: 600 }}>
                Fees: ₹{college.fees.toLocaleString()} / year
              </div>
            </div>
          </Link>
        ))}
        {!loading && colleges.length === 0 && (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#999", marginTop: "40px" }}>
            No colleges match your search criteria.
          </p>
        )}
      </div>
    </div>
  );
}

