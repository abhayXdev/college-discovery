"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" },
    card: { width: "100%", maxWidth: "500px", border: "6px solid #000", padding: "60px", background: "#fff", position: "relative" as const },
    header: { marginBottom: "40px" },
    title: { fontSize: "48px", fontWeight: 900, textTransform: "uppercase" as const, lineHeight: 0.8, letterSpacing: "-0.05em" },
    label: { display: "block", fontSize: "12px", fontWeight: 900, textTransform: "uppercase" as const, marginBottom: "5px" },
    input: { width: "100%", padding: "20px", border: "4px solid #000", fontSize: "18px", fontWeight: 700, marginBottom: "30px", outline: "none", boxSizing: "border-box" as const },
    button: { width: "100%", padding: "20px", background: "#E11D48", color: "#fff", border: "none", fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const, cursor: "pointer" },
    footer: { marginTop: "30px", textAlign: "center" as const, fontWeight: 800, fontSize: "14px" }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ position: "absolute", top: "-20px", left: "40px", background: "#FACC15", padding: "10px 20px", border: "4px solid #000", fontWeight: 900 }}>REGISTRATION_PROTOCOL</div>
        
        <div style={styles.header}>
          <h1 style={styles.title}>Join<br />Discovery</h1>
        </div>

        {error && <div style={{ border: "4px solid #000", background: "#000", color: "#fff", padding: "15px", fontWeight: 900, marginBottom: "30px", fontSize: "14px" }}>ERROR_LOG: {error}</div>}

        <form onSubmit={handleRegister}>
          <label style={styles.label}>Register_Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <label style={styles.label}>Creation_Key</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "COMMITTING..." : "INITIALIZE_IDENTITY →"}
          </button>
        </form>

        <div style={styles.footer}>
          ALREADY_REGISTERED? <Link href="/login" style={{ color: "#000", textDecoration: "none" }}>SIGN_IN</Link>
        </div>
      </div>
    </div>
  );
}
