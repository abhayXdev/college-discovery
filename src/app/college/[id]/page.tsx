"use client";
import { useState, useEffect, use } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    apiRequest(`/api/colleges/${id}`)
      .then((res) => setCollege(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!authHelper.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/api/user/saved", {
        method: "POST",
        body: JSON.stringify({ collegeId: id }),
      });
      alert("DATA_COMMITTED_TO_WATCHLIST");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "100px", fontSize: "32px", fontWeight: 900, textAlign: "center" }}>READING_RECORD...</div>;
  if (!college) return <div style={{ padding: "100px", fontSize: "32px", fontWeight: 900, textAlign: "center" }}>RECORD_NOT_FOUND</div>;

  const styles = {
    hero: { border: "6px solid #000" },
    tab: (active: boolean) => ({ transition: "none" }),
    content: { border: "4px solid #000" },
    statBox: { background: "#FACC15", textAlign: "center" as const },
    saveBtn: { background: "#000", color: "#fff", border: "none", padding: "20px 40px", fontWeight: 900, cursor: "pointer", fontSize: "18px", textTransform: "uppercase" as const }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:px-10 md:py-20">
      <div style={styles.hero} className="p-8 md:p-16 mb-10 md:mb-12 relative">
        <div className="md:absolute relative md:-top-8 md:right-16 bg-[#E11D48] text-white p-4 md:px-10 md:py-5 font-black text-xl md:text-2xl border-4 border-black mb-10 md:mb-0 text-center inline-block">
          OFFICIAL_RANK: #{college.rank}
        </div>
        <h1 className="text-3xl md:text-7xl font-black uppercase leading-tight md:leading-[0.9] mb-5">{college.name}</h1>
        <p className="text-lg md:text-2xl font-bold text-gray-500 uppercase tracking-tight">LOCATION: {college.city}, {college.state} // {college.rating} STAR_RATING</p>
        
        <div className="mt-10">
          <button onClick={handleSave} disabled={saving} style={styles.saveBtn} className="w-full md:w-auto">
            {saving ? "EXECUTING..." : "ADD_TO_COLLECTION"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row border-4 border-black mb-10 md:mb-12 bg-black">
        {["overview", "courses", "placements", "reviews"].map(tab => (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 p-5 md:p-6 text-center cursor-pointer font-black text-sm md:text-base uppercase transition-none border-b-4 md:border-b-0 md:border-r-4 border-black last:border-r-0 ${activeTab === tab ? "bg-black text-white" : "bg-white text-black"}`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div style={styles.content} className="p-8 md:p-16">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase">Analysis_Report</h2>
            <p className="text-base md:text-xl leading-relaxed text-gray-700 font-bold">{college.overview}</p>
            
            <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-black border-4 border-black">
              <div style={styles.statBox} className="p-10 md:p-14">
                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-black">PERFORMANCE_INDEX</div>
                <div className="text-4xl md:text-6xl font-black mt-2">{college.score}</div>
              </div>
              <div style={styles.statBox} className="p-10 md:p-14">
                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-black">CAPITAL_OUTLAY</div>
                <div className="text-4xl md:text-6xl font-black mt-2">₹{college.fees.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {college.courses?.map((c: any) => (
              <div key={c.id} className="border-4 border-black p-8 font-black text-lg md:text-xl uppercase">{c.name}</div>
            ))}
          </div>
        )}

        {activeTab === "placements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-black border-4 border-black">
            <div className="p-10 md:p-14 bg-[#138808] text-white text-center">
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest">MEDIAN_YIELD</div>
              <div className="text-4xl md:text-6xl font-black mt-2">₹{(college.medianSalary / 100000).toFixed(1)} LPA</div>
            </div>
            <div className="p-10 md:p-14 bg-black text-white text-center">
              <div className="text-[10px] md:text-xs font-black uppercase tracking-widest">PEAK_RESULT</div>
              <div className="text-4xl md:text-6xl font-black mt-2">₹{(college.highestPackage / 10000000).toFixed(1)} CR</div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-10">
            {college.reviews?.map((r: any) => (
              <div key={r.id} className="border-b-4 border-black pb-10 last:border-b-0">
                <div className="text-xl md:text-2xl font-black mb-3">GRADE: {r.rating}/5</div>
                <p className="text-lg md:text-xl font-bold text-gray-700">{r.content}</p>
                <div className="text-[10px] md:text-xs font-black text-gray-400 mt-5 uppercase">AUDIT_BY: {r.user.email} // {new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {(!college.reviews || college.reviews.length === 0) && (
              <div className="text-center py-20 border-4 border-dashed border-black">
                <h3 className="text-xl font-black uppercase">NO_USER_REVIEWS_ON_RECORD</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
