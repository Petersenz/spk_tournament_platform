import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { History, Trophy, Swords, Calendar, Gamepad2 } from "lucide-react";
import Image from "next/image";

export default async function PlayerHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user's participant IDs
  const { data: userParticipants } = await supabase
    .from("participants")
    .select("id")
    .eq("user_id", user.id);

  const pIds = userParticipants?.map((p) => p.id) || [];

  let history = [];
  if (pIds.length > 0) {
    const { data } = await supabase
      .from("matches")
      .select(
        `
        *, 
        stages(
          name, 
          tournament_id, 
          tournaments(
            name, 
            games(name, logo_url)
          )
        ), 
        p1:participants!participant1_id(id, name), 
        p2:participants!participant2_id(id, name)
      `,
      )
      .or(
        `participant1_id.in.(${pIds.map((id) => `"${id}"`).join(",")}),participant2_id.in.(${pIds.map((id) => `"${id}"`).join(",")})`,
      )
      .eq("status", "completed")
      .order("created_at", { ascending: false });
    history = data || [];
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute -left-4 top-0 h-full w-1 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(244,0,9,0.5)]"></div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-white">
          Match History
        </h1>
        <p className="text-text-tertiary font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
          Performance & Achievements
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {history.length === 0 ? (
          <div className="bg-[#0c0c0e] border border-dashed border-white/5 rounded-[3rem] p-24 text-center group hover:border-brand-primary/30 transition-all">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-brand-primary blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <History className="h-20 w-20 text-white/5 relative z-10 mx-auto" />
            </div>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white mb-3">
              No battles recorded
            </h3>
            <p className="text-text-tertiary max-w-sm mx-auto font-medium leading-relaxed mb-10 text-sm">
              Once you complete matches in tournaments, your performance data
              will be analyzed and displayed here.
            </p>
            <Link href="/tournaments">
              <span className="inline-flex items-center gap-2 bg-white/5 hover:bg-brand-primary px-8 py-4 rounded-2xl text-white font-bold uppercase tracking-widest text-[11px] transition-all shadow-xl">
                Browse Tournaments <Swords className="h-4 w-4" />
              </span>
            </Link>
          </div>
        ) : (
          history.map((m) => {
            const isWinner = m.winner_id && pIds.includes(m.winner_id);
            const p1IsUser = pIds.includes(m.participant1_id);
            const p2IsUser = pIds.includes(m.participant2_id);

            const gameLogo = m.stages?.tournaments?.games?.logo_url;

            return (
              <div key={m.id} className="group relative">
                {/* Glow Effect for Winner */}
                {isWinner && (
                  <div className="absolute inset-0 bg-success/5 blur-[40px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}

                <div
                  className={`relative z-10 bg-[#0c0c0e] border rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:translate-y-[-4px] shadow-xl ${
                    isWinner
                      ? "border-success/20 hover:border-success/50"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Game Branding & Meta */}
                    <div className="w-full lg:w-72 p-8 bg-white/2 flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-white/5">
                      <div className="h-14 w-14 rounded-2xl bg-[#0a0a0c] border border-white/10 p-3 flex items-center justify-center shrink-0">
                        {gameLogo ? (
                          <Image
                            src={
                              gameLogo.startsWith("http")
                                ? gameLogo
                                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/game-assets/${gameLogo}`
                            }
                            alt="Game"
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        ) : (
                          <Gamepad2 className="h-6 w-6 text-brand-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] truncate max-w-[140px]">
                          {m.stages?.tournaments?.name}
                        </div>
                        <div className="text-xs font-bold text-white truncate max-w-[140px] uppercase tracking-tight">
                          {m.stages?.name}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-text-tertiary font-bold uppercase tracking-wider">
                          <Calendar className="h-3 w-3" />
                          {new Date(m.created_at).toLocaleDateString(
                            undefined,
                            { day: "2-digit", month: "short" },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Card Style (5.7) */}
                    <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
                      <div className="w-full max-w-xl grid grid-cols-1 gap-2">
                        {/* Participant 1 Row */}
                        <div
                          className={`flex items-center justify-between h-12 px-6 rounded-xl border transition-all ${
                            m.winner_id === m.participant1_id
                              ? "bg-white/5 border-brand-primary/30 shadow-[0_0_20px_rgba(244,0,9,0.1)] relative"
                              : "bg-transparent border-white/5 opacity-60"
                          }`}
                        >
                          {m.winner_id === m.participant1_id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-full"></div>
                          )}
                          <div className="flex items-center gap-3 truncate">
                            {p1IsUser && (
                              <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></div>
                            )}
                            <span
                              className={`font-display text-sm font-black uppercase tracking-tight truncate ${m.winner_id === m.participant1_id ? "text-white" : "text-text-tertiary"}`}
                            >
                              {m.p1?.name || "TBD"}
                            </span>
                          </div>
                          <span className="font-display text-lg font-black text-white ml-4">
                            {m.score1 || 0}
                          </span>
                        </div>

                        {/* VS Label */}
                        <div className="flex justify-center -my-2 relative z-20">
                          <div className="px-4 py-1 bg-[#0c0c0e] rounded-full border border-white/5">
                            <Swords className="h-3 w-3 text-text-tertiary" />
                          </div>
                        </div>

                        {/* Participant 2 Row */}
                        <div
                          className={`flex items-center justify-between h-12 px-6 rounded-xl border transition-all ${
                            m.winner_id === m.participant2_id
                              ? "bg-white/5 border-brand-primary/30 shadow-[0_0_20px_rgba(244,0,9,0.1)] relative"
                              : "bg-transparent border-white/5 opacity-60"
                          }`}
                        >
                          {m.winner_id === m.participant2_id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary rounded-full"></div>
                          )}
                          <div className="flex items-center gap-3 truncate">
                            {p2IsUser && (
                              <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse"></div>
                            )}
                            <span
                              className={`font-display text-sm font-black uppercase tracking-tight truncate ${m.winner_id === m.participant2_id ? "text-white" : "text-text-tertiary"}`}
                            >
                              {m.p2?.name || "TBD"}
                            </span>
                          </div>
                          <span className="font-display text-lg font-black text-white ml-4">
                            {m.score2 || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Result Badge */}
                    <div className="w-full lg:w-48 p-8 flex items-center justify-center lg:border-l border-white/5 bg-white/2">
                      {isWinner ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <Trophy className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-black text-success uppercase tracking-[0.3em]">
                            Victory
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-text-tertiary">
                            <Swords className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em]">
                            Defeat
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
