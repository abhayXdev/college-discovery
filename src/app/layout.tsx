"use client";
import Link from "next/link";
import { authHelper } from "@/lib/auth-helper";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(authHelper.isAuthenticated());
  }, []);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        <nav
          style={{
            display: "flex",
            gap: "20px",
            padding: "15px 20px",
            borderBottom: "1px solid #ccc",
            background: "#f8f9fa",
          }}
        >
          <Link href="/" style={{ fontWeight: "bold", textDecoration: "none", color: "#333" }}>
            CollegeDiscovery
          </Link>
          <div style={{ flex: 1 }} />
          <Link href="/predictor" style={{ textDecoration: "none", color: "#007bff", marginRight: "20px" }}>
            Predictor
          </Link>
          {isAuth ? (
            <>
              <Link href="/saved" style={{ textDecoration: "none", color: "#007bff" }}>
                Saved
              </Link>
              <button
                onClick={() => authHelper.logout()}
                style={{
                  background: "none",
                  border: "none",
                  color: "#dc3545",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "16px",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ textDecoration: "none", color: "#007bff" }}>
                Login
              </Link>
              <Link href="/register" style={{ textDecoration: "none", color: "#007bff" }}>
                Register
              </Link>
            </>
          )}
        </nav>
        <main style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
