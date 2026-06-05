"use client";
import Link from "next/link";
import { authHelper } from "@/lib/auth-helper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  const checkAuth = () => {
    setIsAuth(authHelper.isAuthenticated());
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    authHelper.logout();
    router.push("/login");
  };

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Inter', 'Helvetica', sans-serif", background: "#fff", color: "#000" }}>
        <nav
          className="flex flex-col md:flex-row items-center border-b-[6px] border-black bg-white min-h-[80px]"
        >
          <Link href="/" className="h-full flex items-center px-6 md:px-10 bg-black text-white font-black text-xl md:text-2xl tracking-tighter uppercase no-underline min-h-[80px] w-full md:w-auto justify-center md:justify-start">
            COLLEGE_ENGINE
          </Link>
          <div className="flex-1 hidden md:block" />
          <div className="flex flex-wrap items-stretch h-full w-full md:w-auto">
            <NavLink href="/predictor">Predictor</NavLink>
            <NavLink href="/discussions">Community</NavLink>
            {isAuth ? (
              <>
                <NavLink href="/saved">Watchlist</NavLink>
                <button
                  onClick={handleLogout}
                  className="h-full border-none border-l-[3px] border-black bg-[#E11D48] text-white cursor-pointer px-6 md:px-8 py-4 md:py-0 text-sm font-black uppercase"
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
    <Link href={href} className={`flex-1 md:flex-none flex items-center justify-center px-6 md:px-8 py-4 md:py-0 no-underline text-sm font-black uppercase border-t-[3px] md:border-t-0 md:border-l-[3px] border-black tracking-widest ${highlight ? "bg-black text-white" : "bg-transparent text-black"}`}>
      {children}
    </Link>
  );
}
