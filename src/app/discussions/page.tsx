"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";
import Link from "next/link";

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fetchDiscussions = async () => {
    try {
      const res = await apiRequest("/api/discussions");
      setDiscussions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscussions(); }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHelper.isAuthenticated()) return alert("AUTH_ERROR: LOGIN_REQUIRED");
    setIsPosting(true);
    try {
      await apiRequest("/api/discussions/create", {
        method: "POST",
        body: JSON.stringify({ title, content }),
      });
      setTitle("");
      setContent("");
      fetchDiscussions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "80px 40px" },
    hero: { borderLeft: "15px solid #000", paddingLeft: "40px", marginBottom: "80px" },
    title: { fontSize: "5rem", fontWeight: 900, lineHeight: 0.85, textTransform: "uppercase" as const, letterSpacing: "-0.05em", margin: "0 0 20px 0" },
    postCard: { border: "4px solid #000", padding: "40px", background: "#fff", marginBottom: "60px", position: "relative" as const },
    input: { width: "100%", padding: "20px", border: "4px solid #000", fontSize: "18px", fontWeight: 700, marginBottom: "20px", outline: "none", boxSizing: "border-box" as const },
    button: { background: "#000", color: "#fff", border: "none", padding: "20px 40px", fontWeight: 900, fontSize: "16px", textTransform: "uppercase" as const, cursor: "pointer" },
    thread: { border: "4px solid #000", padding: "40px", marginBottom: "30px", background: "#fff" },
    tag: { padding: "5px 15px", background: "#FACC15", fontWeight: 900, fontSize: "12px", border: "2px solid #000", textTransform: "uppercase" as const }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:px-10 md:py-20">
      <div style={styles.hero} className="mb-12 md:mb-20">
        <h1 className="text-4xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-5">Peer_To_Peer<br />Intelligence</h1>
        <p className="text-sm md:text-xl font-bold text-gray-500 uppercase tracking-widest">Community Query System // Collective Assessment</p>
      </div>

      <div style={styles.postCard} className="p-8 md:p-14 mb-16 md:mb-20">
        <div style={{ position: "absolute", top: "-25px", left: "40px", background: "#000", color: "#fff", padding: "10px 30px", border: "4px solid #000", fontWeight: 900 }}>QUERY_INITIALIZATION</div>
        <form onSubmit={handlePost}>
          <input 
            placeholder="SUBJECT_HEADER" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            style={styles.input} 
            className="text-lg md:text-xl p-5 md:p-6"
            required
          />
          <textarea 
            placeholder="DATA_CONTEXT_AND_DESCRIPTION" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            style={{ ...styles.input, height: "150px", resize: "none" }} 
            className="text-lg md:text-xl p-5 md:p-6"
            required
          />
          <button type="submit" disabled={isPosting} style={styles.button} className="w-full md:w-auto">
            {isPosting ? "TRANSMITTING..." : "BROADCAST_QUERY →"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl md:text-4xl font-black mb-8 uppercase border-b-4 border-black pb-3">Live_Intelligence_Feed</h2>
        {loading ? (
          <div className="p-20 text-center bg-black text-white font-black uppercase tracking-widest">SYNCING_COMMUNITY_THREADS...</div>
        ) : (
          <div className="space-y-8">
            {discussions.map(d => (
              <Link key={d.id} href={`/discussions/${d.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div style={styles.thread} className="p-8 md:p-14 hover:border-[#E11D48] transition-colors cursor-pointer">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <span style={styles.tag}>{d.college?.name || "GENERAL_FORUM"}</span>
                    <span className="font-black text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">TIMESTAMP: {new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black uppercase mb-4 leading-tight">{d.title}</h3>
                  <p className="text-base md:text-xl font-bold text-gray-700 leading-relaxed mb-10">{d.content}</p>
                  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center border-t-4 border-black pt-6 gap-6">
                    <span className="text-lg md:text-xl text-[#E11D48] font-black uppercase">RESPONSES: {d._count.answers}</span>
                    <span className="text-xs md:text-sm font-black text-black uppercase tracking-tighter truncate">SOURCE: {d.user.email}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
