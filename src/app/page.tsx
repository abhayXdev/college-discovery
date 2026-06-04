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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [sortBy]);

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          placeholder="Search name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          placeholder="City..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "8px" }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px" }}>
          <option value="rank">Sort by Rank</option>
          <option value="fees">Sort by Fees</option>
          <option value="score">Sort by Score</option>
        </select>
        <button onClick={fetchColleges} style={{ padding: "8px 15px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          Search
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: "grid", gap: "15px" }}>
          {colleges.map((college: any) => (
            <div key={college.id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "4px" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>{college.name}</h3>
              <p style={{ margin: "5px 0" }}>{college.city}, {college.state}</p>
              <p style={{ margin: "5px 0" }}>Rank: {college.rank} | Fees: ₹{college.fees}</p>
              <Link href={`/college/${college.id}`} style={{ color: "#007bff", textDecoration: "none" }}>
                View Details
              </Link>
            </div>
          ))}
          {colleges.length === 0 && <p>No colleges found.</p>}
        </div>
      )}
    </div>
  );
}
