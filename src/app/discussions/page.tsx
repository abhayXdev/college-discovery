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
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Peer_To_Peer<br />Intelligence</h1>
        <p style={{ fontSize: "20px", fontWeight: 700, color: "#666", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Community Query System // Collective Assessment</p>
      </div>

      <div style={styles.postCard}>
        <div style={{ position: "absolute", top: "-25px", left: "40px", background: "#000", color: "#fff", padding: "10px 30px", border: "4px solid #000", fontWeight: 900 }}>QUERY_INITIALIZATION</div>
        <form onSubmit={handlePost}>
          <input 
            placeholder="SUBJECT_HEADER" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            style={styles.input} 
            required
          />
          <textarea 
            placeholder="DATA_CONTEXT_AND_DESCRIPTION" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            style={{ ...styles.input, height: "150px", resize: "none" }} 
            required
          />
          <button type="submit" disabled={isPosting} style={styles.button}>
            {isPosting ? "TRANSMITTING..." : "BROADCAST_QUERY →"}
          </button>
        </form>
      </div>

      <div>
        <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "30px", textTransform: "uppercase", borderBottom: "4px solid #000", paddingBottom: "10px" }}>Live_Intelligence_Feed</h2>
        {loading ? (
          <div style={{ padding: "40px", fontSize: "24px", fontWeight: 900, background: "#000", color: "#fff", textAlign: "center" }}>SYNCING_COMMUNITY_THREADS...</div>
        ) : discussions.map(d => (
          <div key={d.id} style={styles.thread}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span style={styles.tag}>{d.college?.name || "GENERAL_FORUM"}</span>
              <span style={{ fontWeight: 800, fontSize: "12px", color: "#999" }}>TIMESTAMP: {new Date(d.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "15px", textTransform: "uppercase" }}>{d.title}</h3>
            <p style={{ fontSize: "18px", lineHeight: 1.6, color: "#444", marginBottom: "30px", fontWeight: 600 }}>{d.content}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "4px solid #000", paddingTop: "20px" }}>
              <span style={{ fontSize: "16px", color: "#E11D48", fontWeight: 900 }}>RESPONSES: {d._count.answers}</span>
              <span style={{ fontSize: "14px", fontWeight: 800 }}>SOURCE: {d.user.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
