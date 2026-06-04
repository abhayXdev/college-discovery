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
      <body style={{ margin: 0, fontFamily: "'Inter', 'Helvetica', sans-serif", background: "#fff", color: "#000" }}>
        <nav
          style={{
            display: "flex",
            padding: "0",
            borderBottom: "6px solid #000",
            background: "#fff",
            height: "80px",
            alignItems: "center"
          }}
        >
          <Link href="/" style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            padding: "0 40px", 
            background: "#000", 
            color: "#fff", 
            fontWeight: 900, 
            textDecoration: "none", 
            fontSize: "24px",
            letterSpacing: "-0.05em",
            textTransform: "uppercase"
          }}>
            COLLEGE_ENGINE
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", height: "100%" }}>
            <NavLink href="/predictor">Predictor</NavLink>
            <NavLink href="/discussions">Community</NavLink>
            {isAuth ? (
              <>
                <NavLink href="/saved">Watchlist</NavLink>
                <button
                  onClick={() => authHelper.logout()}
                  style={{
                    height: "100%",
                    border: "none",
                    borderLeft: "3px solid #000",
                    background: "#E11D48",
                    color: "#fff",
                    cursor: "pointer",
                    padding: "0 30px",
                    fontSize: "14px",
                    fontWeight: 900,
                    textTransform: "uppercase"
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink href="/login">Login</NavLink>
                <NavLink href="/register" highlight>Register</NavLink>
              </>
            )}
          </div>
        </nav>
        <main style={{ minHeight: "calc(100vh - 86px)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

function NavLink({ href, children, highlight }: { href: string, children: React.ReactNode, highlight?: boolean }) {
  return (
    <Link href={href} style={{ 
      height: "100%", 
      display: "flex", 
      alignItems: "center", 
      padding: "0 30px", 
      textDecoration: "none", 
      color: highlight ? "#fff" : "#000", 
      background: highlight ? "#000" : "transparent",
      fontWeight: 900, 
      fontSize: "14px",
      textTransform: "uppercase",
      borderLeft: "3px solid #000",
      letterSpacing: "0.05em"
    }}>
      {children}
    </Link>
  );
}
