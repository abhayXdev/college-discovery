"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SavedCollegesPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authHelper.isAuthenticated()) {
      router.push("/login");
      return;
    }

    apiRequest("/api/user/saved")
      .then((res) => setSaved(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center text-2xl font-black bg-black text-white uppercase tracking-widest">Syncing_Watchlist...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:px-10 md:py-20">
      <div className="border-l-[15px] border-black pl-10 mb-16 md:mb-24">
        <h1 className="text-4xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-5">Personal<br />Collection</h1>
        <p className="text-sm md:text-xl font-extrabold uppercase tracking-widest text-black">Verified candidates // saved for audit</p>
      </div>

      {saved.length === 0 ? (
        <div className="p-20 border-[4px] border-dashed border-black text-center">
            <h3 className="text-2xl md:text-4xl font-black uppercase">Collection_Empty</h3>
            <p className="font-bold text-gray-500 uppercase mt-2">Navigate to search to add institutional entities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {saved.map((item: any) => (
            <div key={item.id} className="border-[4px] border-black bg-white flex flex-col relative">
              <div className="bg-black text-white px-5 py-3 font-black text-[10px] uppercase flex justify-between">
                <span>{item.college.state} // {item.college.rating} RATING</span>
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-xl md:text-2xl font-black uppercase mb-2 leading-tight">{item.college.name}</h3>
                <p className="font-bold text-black text-sm md:text-base">📍 {item.college.city}</p>
              </div>
              <div className="mt-auto flex border-t-[4px] border-black">
                <div className="flex-1 p-4 bg-black text-white font-black text-center text-sm md:text-base">
                  #{item.college.rank}
                </div>
                <Link href={`/college/${item.college.id}`} className="flex-1 p-4 bg-white text-black font-black text-center no-underline border-l-[4px] border-black hover:bg-gray-100 transition-colors">
                  PROFILE →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
