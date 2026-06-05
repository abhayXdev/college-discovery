"use client";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      authHelper.setToken(res.data.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" },
    card: { width: "100%", maxWidth: "500px", border: "6px solid #000", background: "#fff", position: "relative" as const },
    header: { marginBottom: "40px" },
    title: { fontSize: "42px", fontWeight: 900, textTransform: "uppercase" as const, lineHeight: 0.8, letterSpacing: "-0.05em" },
    label: { display: "block", fontSize: "12px", fontWeight: 900, textTransform: "uppercase" as const, marginBottom: "5px" },
    input: { width: "100%", padding: "20px", border: "4px solid #000", fontSize: "18px", fontWeight: 700, marginBottom: "30px", outline: "none", boxSizing: "border-box" as const },
    button: { width: "100%", padding: "20px", background: "#000", color: "#fff", border: "none", fontSize: "20px", fontWeight: 900, textTransform: "uppercase" as const, cursor: "pointer" },
    footer: { marginTop: "30px", textAlign: "center" as const, fontWeight: 800, fontSize: "14px" }
  };

  return (
    <div style={styles.wrapper} className="px-4">
      <div style={styles.card} className="p-8 md:p-16">
        <div style={{ position: "absolute", top: "-20px", left: "40px", background: "#FACC15", padding: "10px 20px", border: "4px solid #000", fontWeight: 900 }}>AUTHENTICATION_PROTOCOL</div>
        
        <div style={styles.header}>
          <h1 style={styles.title}>Secure<br />Identity</h1>
        </div>

        {error && <div style={{ border: "4px solid #000", background: "#E11D48", color: "#fff", padding: "15px", fontWeight: 900, marginBottom: "30px", fontSize: "14px" }}>ERROR_LOG: {error}</div>}

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Identity_Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <label style={styles.label}>Access_Key</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "VALIDATING..." : "ESTABLISH_SESSION →"}
          </button>
        </form>

        <div style={styles.footer}>
          NO_ACCOUNT? <Link href="/register" style={{ color: "#E11D48", textDecoration: "none" }}>REGISTER_USER</Link>
        </div>
      </div>
    </div>
  );
}
