"use client";
import { useState, useEffect, use } from "react";
import { apiRequest } from "@/lib/api-client";
import { authHelper } from "@/lib/auth-helper";
import Link from "next/link";

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsPosting] = useState(false);

  const fetchThread = async () => {
    try {
      const res = await apiRequest(`/api/discussions/${id}`);
      setThread(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchThread(); }, [id]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authHelper.isAuthenticated()) return alert("AUTH_ERROR: LOGIN_REQUIRED");
    setIsPosting(true);
    try {
      await apiRequest("/api/discussions/answer", {
        method: "POST",
        body: JSON.stringify({ discussionId: id, content: answer }),
      });
      setAnswer("");
      fetchThread(); // Refresh answer list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-2xl font-black bg-black text-white uppercase">Retrieving_Thread_Context...</div>;
  if (!thread) return <div className="p-20 text-center text-2xl font-black bg-red-600 text-white border-4 border-black uppercase">Thread_Not_Found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:px-10 md:py-20">
      <div className="mb-10">
        <Link href="/discussions" className="bg-black text-white px-6 py-3 font-black text-sm uppercase no-underline hover:bg-[#E11D48] transition-colors">← Return_To_Feed</Link>
      </div>

      <div className="border-4 border-black p-8 md:p-16 mb-16 bg-white relative">
        <div className="flex justify-between items-center mb-10">
            <span className="bg-[#FACC15] text-black px-4 py-2 font-black text-xs border-2 border-black uppercase tracking-widest">{thread.college?.name || "GENERAL_FORUM"}</span>
            <span className="text-gray-400 font-black text-[10px] md:text-xs uppercase tracking-tighter">TIMESTAMP: {new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
        <h1 className="text-2xl md:text-6xl font-black uppercase mb-6 leading-tight">{thread.title}</h1>
        <p className="text-base md:text-2xl font-bold text-gray-700 leading-relaxed mb-10">{thread.content}</p>
        <div className="text-[10px] md:text-sm font-black uppercase tracking-tighter border-t-2 border-black pt-5 text-gray-400">
            INITIATED_BY: {thread.user.email}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl md:text-4xl font-black mb-10 uppercase border-b-4 border-black pb-3">Peer_Responses</h2>
        
        <div className="space-y-6 mb-16">
          {thread.answers?.map((a: any) => (
            <div key={a.id} className="border-l-8 border-black p-8 md:p-10 bg-gray-50">
              <p className="text-base md:text-xl font-bold mb-6 text-black">{a.content}</p>
              <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest flex justify-between">
                <span>RESPONDENT: {a.user.email}</span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {(!thread.answers || thread.answers.length === 0) && (
            <div className="p-12 border-4 border-dashed border-black text-center">
                <h3 className="text-xl font-black uppercase text-gray-400">ZERO_RESPONSES_ON_RECORD</h3>
            </div>
          )}
        </div>

        <div className="border-4 border-black p-8 md:p-12 bg-black text-white">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Submit_Assessment</h3>
            <form onSubmit={handleSubmitAnswer}>
                <textarea 
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="ENTER_DATA_DRIVEN_RESPONSE"
                    className="w-full h-40 p-6 text-black font-black text-lg outline-none border-4 border-black mb-6 resize-none bg-white"
                    required
                />
                <button type="submit" disabled={isSubmitting} className="bg-[#E11D48] text-white px-10 py-5 font-black uppercase text-lg border-none cursor-pointer w-full md:w-auto hover:bg-white hover:text-black transition-colors">
                    {isSubmitting ? "TRANSMITTING..." : "PUBLISH_RESPONSE →"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
