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
    <div className="max-w-7xl mx-auto px-6 py-10 md:px-10 md:py-20">
      <h1 className="text-4xl md:text-6xl font-black uppercase mb-10 tracking-tighter">Compare Colleges</h1>
      
      <div className="overflow-x-auto border-4 border-black">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              <th className="text-left p-6 md:p-10 bg-gray-50 border-b-4 border-black font-black text-sm uppercase">Feature</th>
              {colleges.map(c => (
                <th key={c.id} className="text-center p-6 md:p-10 bg-black text-white border-b-4 border-black border-l-4 font-black text-sm uppercase min-w-[200px]">{c.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-6 md:p-8 border-b-2 border-gray-200 font-black text-xs uppercase bg-gray-50">Location</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-b-2 border-gray-200 border-l-4 text-center font-bold text-sm">{c.city}, {c.state}</td>)}
            </tr>
            <tr>
              <td className="p-6 md:p-8 border-b-2 border-gray-200 font-black text-xs uppercase bg-gray-50">NIRF Rank</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-b-2 border-gray-200 border-l-4 text-center font-black text-lg">#{c.rank ?? "N/A"}</td>)}
            </tr>
            <tr>
              <td className="p-6 md:p-8 border-b-2 border-gray-200 font-black text-xs uppercase bg-gray-50">Annual Fees</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-b-2 border-gray-200 border-l-4 text-center font-black text-lg">₹{c.fees?.toLocaleString() ?? "N/A"}</td>)}
            </tr>
            <tr>
              <td className="p-6 md:p-8 border-b-2 border-gray-200 font-black text-xs uppercase bg-gray-50">Overall Score</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-b-2 border-gray-200 border-l-4 text-center font-black text-lg">{c.score ?? "N/A"} / 100</td>)}
            </tr>
            <tr>
              <td className="p-6 md:p-8 border-b-2 border-gray-200 font-black text-xs uppercase bg-gray-50">Teaching (TLR)</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-b-2 border-gray-200 border-l-4 text-center font-bold">{c.tlr ?? "0.0"}</td>)}
            </tr>
            <tr>
              <td className="p-6 md:p-8 border-b-2 border-gray-200 font-black text-xs uppercase bg-gray-50">Research (RPC)</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-b-2 border-gray-200 border-l-4 text-center font-bold">{c.rpc ?? "0.0"}</td>)}
            </tr>
            <tr>
              <td className="p-6 md:p-8 font-black text-xs uppercase bg-gray-50">Graduation (GO)</td>
              {colleges.map(c => <td key={c.id} className="p-6 md:p-8 border-l-4 text-center font-bold">{c.go ?? "0.0"}</td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-block bg-black text-white px-10 py-5 font-black uppercase no-underline text-lg hover:bg-[#E11D48] transition-colors">← Back to Discovery</Link>
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
