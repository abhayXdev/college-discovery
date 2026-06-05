"use client";
import { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";

export default function HomePage() {
  const [colleges, setColleges] = useState([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    apiRequest("/api/colleges/recommendations").then(res => setRecommendations(res.data)).catch(console.error);
    const saved = JSON.parse(localStorage.getItem("compare_ids") || "[]");
    setSelectedForCompare(saved);
  }, []);

  useEffect(() => {
    // Reset page to 1 on new search/filter
    setPage(1);
  }, [search, city, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchColleges(), 400);
    return () => clearTimeout(timeout);
  }, [search, city, sortBy, page]);

  const fetchColleges = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const searchTerm = search.trim();
      const cityTerm = city.trim();

      if (searchTerm) params.append("search", searchTerm);
      if (cityTerm) params.append("city", cityTerm);
      params.append("sortBy", sortBy);
      params.append("page", page.toString());
      params.append("limit", "10");

      const url = `/api/colleges?${params.toString()}`;
      const res = await apiRequest(url, { signal: controller.signal });
      
      if (!res || !res.success) throw new Error("INVALID_SERVER_RESPONSE");
      
      setColleges(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalResults(res.pagination?.total || 0);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("DISCOVERY_FETCH_ERROR:", err);
      setError(`COMMUNICATION_FAILURE: ${err.message || "UNABLE_TO_RETRIEVE_RECORDS"}`);
      setColleges([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchColleges();
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
    searchEngine: { border: "4px solid #000", display: "flex", flexWrap: "wrap" as const, marginBottom: "20px", background: "#000" },
    input: { flex: 1, border: "none", padding: "25px 30px", fontSize: "20px", fontWeight: 800, outline: "none", background: "#fff", borderRight: "4px solid #000" },
    select: { border: "none", padding: "0 30px", fontSize: "16px", fontWeight: 900, outline: "none", background: "#FACC15", cursor: "pointer", textTransform: "uppercase" as const, borderRight: "4px solid #000" },
    searchBtn: { border: "none", padding: "0 40px", background: "#E11D48", color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: "18px", textTransform: "uppercase" as const },
    grid: { display: "grid", gap: "40px" },
    pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "60px" },
    pageBtn: { padding: "15px 30px", background: "#000", color: "#fff", border: "none", fontWeight: 900, cursor: "pointer", fontSize: "14px", textTransform: "uppercase" as const }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10 md:px-10 md:py-20 overflow-x-hidden">
      {selectedForCompare.length > 0 && (
        <div style={{ position: "fixed", bottom: "0", left: "0", width: "100%", background: "#E11D48", color: "#fff", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 1000, borderTop: "6px solid #000" }}>
          <span className="text-lg md:text-2xl font-black uppercase">Queue: {selectedForCompare.length}/3</span>
          <Link href={`/compare?ids=${selectedForCompare.join(",")}`} className="bg-black text-white px-6 py-3 md:px-10 md:py-4 font-black no-underline text-sm md:text-lg">RUN_ANALYTICS →</Link>
        </div>
      )}

      <div style={styles.hero} className="mb-12 md:mb-24 px-4 md:px-10">
        <h1 className="text-4xl md:text-8xl font-black leading-[0.85] uppercase tracking-tighter mb-5">National<br />Academic_Index</h1>
        <p className="text-sm md:text-xl font-extrabold uppercase tracking-widest text-black">Institutional performance audit // verified data system</p>
      </div>

      <form onSubmit={handleManualSearch} className="mb-10 md:mb-20 px-4 md:px-0">
        <div className="border-[4px] border-black flex flex-col md:flex-row bg-black">
          <input placeholder="ENTITY_NAME" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 border-none p-5 md:p-6 text-lg md:text-xl font-black outline-none bg-white md:border-r-[4px] border-black" />
          <input placeholder="REGION_ID" value={city} onChange={e => setCity(e.target.value)} className="flex-1 border-none p-5 md:p-6 text-lg md:text-xl font-black outline-none bg-white md:border-r-[4px] border-black" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border-none px-6 py-5 md:p-0 text-sm md:text-base font-black outline-none bg-[#FACC15] cursor-pointer uppercase border-black md:border-r-[4px] min-w-[200px]">
            <option value="rank">SORT_BY_RANK</option>
            <option value="fees">SORT_BY_FEES</option>
            <option value="score">SORT_BY_SCORE</option>
          </select>
          <button type="submit" style={styles.searchBtn} className="py-6 md:py-0 hover:bg-black transition-colors">SEARCH_SYSTEM</button>
        </div>
      </form>

      <div className="mb-10 md:mb-20 px-4 md:px-0 text-xs md:text-sm font-black uppercase tracking-tighter">
        RESULTS_COUNT: {totalResults} ENTITIES_FOUND
      </div>

      {recommendations && !search && (
        <div className="mb-20 px-4 md:px-0">
          <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase border-b-4 border-black pb-3">Priority_Ranked_Entities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {recommendations.topRated.map((c: any) => (
              <CollegeCard key={c.id} college={c} isSelected={selectedForCompare.includes(c.id)} onToggle={() => toggleCompare(c.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="px-4 md:px-0">
        <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase border-b-4 border-black pb-3">Institutional_Database</h2>
        
        {loading && (
          <div className="p-20 text-xl md:text-2xl font-black bg-black text-white text-center uppercase tracking-widest">FETCHING_RECORDS_STREAM...</div>
        )}

        {error && !loading && (
          <div className="p-12 md:p-20 bg-[#E11D48] text-white text-center border-[4px] border-black">
            <h3 className="text-2xl md:text-4xl font-black uppercase mb-5">{error}</h3>
            <button onClick={() => fetchColleges()} className="bg-white text-black px-6 py-3 md:px-10 md:py-4 font-black uppercase cursor-pointer text-sm md:text-lg">RETRY_CONNECTION</button>
          </div>
        )}

        {!loading && !error && colleges.length === 0 && (
          <div className="p-20 border-[4px] border-dashed border-black text-center">
            <h3 className="text-2xl md:text-4xl font-black uppercase mb-2">ZERO_RECORDS_MATCHED</h3>
            <p className="font-bold text-gray-500 uppercase tracking-tighter">Modify search parameters or reset filters.</p>
          </div>
        )}

        {!loading && !error && colleges.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {colleges.map((c: any) => (
                <CollegeCard key={c.id} college={c} isSelected={selectedForCompare.includes(c.id)} onToggle={() => toggleCompare(c.id)} />
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-5 md:gap-10 mt-16 md:mt-24">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className={`w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-black text-white font-black text-xs md:text-sm uppercase ${page === 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {page === 1 ? "←" : "← PREV_PAGE"}
              </button>
              <div className="font-black text-xl md:text-2xl">
                {page} / {totalPages}
              </div>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)} 
                className={`w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-black text-white font-black text-xs md:text-sm uppercase ${page === totalPages ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {page === totalPages ? "→" : "NEXT_PAGE →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CollegeCard({ college, isSelected, onToggle }: any) {
  return (
    <div className={`border-[4px] border-black flex flex-col relative transition-colors ${isSelected ? "bg-[#FACC15]" : "bg-white"}`}>
      <div className="bg-black text-white px-5 py-3 font-black text-[10px] md:text-[12px] uppercase flex justify-between items-center">
        <span className="truncate mr-2">{college.state || "UNKNOWN"} // {college.rating} RATIO</span>
        {college.status === "DEMO" && <span className="bg-[#FACC15] text-black px-2 py-0.5 text-[10px]">DEMO</span>}
        {college.status === "VERIFIED" && <span className="bg-[#138808] text-white px-2 py-0.5 text-[10px]">VERIFIED</span>}
      </div>
      
      <div className="p-6 md:p-8 flex-1">
        <h3 className="text-xl md:text-2xl font-black uppercase mb-2 leading-[1.1]">{college.name}</h3>
        <p className="font-bold text-black text-sm md:text-base">📍 {college.city}</p>
        
        <div className="mt-8 grid grid-cols-2 gap-1 bg-black border-2 border-black">
          <div className="p-4 bg-white text-center">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">FEES</div>
            <div className="text-sm md:text-lg font-black">₹{(college.fees / 1000).toFixed(0)}K</div>
          </div>
          <div className="p-4 bg-white text-center">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">YIELD</div>
            <div className="text-sm md:text-lg font-black text-[#138808]">₹{(college.medianSalary / 100000).toFixed(1)}L</div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex border-t-[4px] border-black">
        <div className="flex-1 p-4 bg-black text-white font-black text-center text-sm md:text-base">
          #{college.rank}
        </div>
        <Link href={`/college/${college.id}`} className="flex-1 p-4 bg-white text-black font-black text-center text-sm md:text-base no-underline border-l-[4px] border-black hover:bg-gray-100 transition-colors">
          PROFILE →
        </Link>
      </div>

      <button 
        onClick={() => onToggle()} 
        className={`absolute -top-4 right-5 px-3 py-2 border-[3px] border-black font-black text-[10px] uppercase cursor-pointer shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${isSelected ? "bg-black text-white" : "bg-[#E11D48] text-white"}`}
      >
        {isSelected ? "REMOVE" : "ADD_QUEUE"}
      </button>
    </div>
  );
}
