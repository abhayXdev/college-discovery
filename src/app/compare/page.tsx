"use client";
import { useEffect, useState, Suspense } from "react";
import { apiRequest } from "@/lib/api-client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids")?.split(",") || [];
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) return setLoading(false);

    apiRequest(`/api/colleges/compare?ids=${ids.join(",")}`)
      .then(res => setColleges(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [ids.join(",")]);

  const styles = {
    container: { maxWidth: "1200px", margin: "50px auto", padding: "0 20px" },
    table: { width: "100%", borderCollapse: "collapse" as const, background: "#fff", borderRadius: "16px", overflow: "hidden" as const, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
    th: { textAlign: "left" as const, padding: "20px", background: "#f8f9fa", borderBottom: "2px solid #eee", fontWeight: 700, color: "#111" },
    td: { padding: "20px", borderBottom: "1px solid #eee", color: "#444" },
    label: { fontWeight: 700, color: "#666", width: "200px" }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px" }}>Analyzing data...</div>;

  if (colleges.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <h2>No colleges selected for comparison.</h2>
        <Link href="/" style={{ color: "#007bff" }}>Back to Search</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom: "30px", fontSize: "2rem" }}>Compare Colleges</h1>
      
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Feature</th>
            {colleges.map(c => (
              <th key={c.id} style={styles.th}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>Location</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>{c.city}, {c.state}</td>)}
          </tr>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>NIRF Rank</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>#{c.rank ?? "N/A"}</td>)}
          </tr>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>Annual Fees</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>₹{c.fees?.toLocaleString() ?? "N/A"}</td>)}
          </tr>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>Overall Score</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>{c.score ?? "N/A"} / 100</td>)}
          </tr>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>Teaching (TLR)</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>{c.tlr ?? "0.0"}</td>)}
          </tr>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>Research (RPC)</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>{c.rpc ?? "0.0"}</td>)}
          </tr>
          <tr>
            <td style={{ ...styles.td, ...styles.label }}>Graduation (GO)</td>
            {colleges.map(c => <td key={c.id} style={styles.td}>{c.go ?? "0.0"}</td>)}
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link href="/" style={{ color: "#007bff", textDecoration: "none", fontWeight: 600 }}>← Back to Discovery</Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "100px" }}>Loading comparison interface...</div>}>
      <CompareContent />
    </Suspense>
  );
}
