import { useState } from "react";
import { Copy, Check, Share2, Home, Settings, ChevronRight, LogOut, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "hsl(110, 20%, 70%)",
  "hsl(90, 35%, 75%)",
  "hsl(35, 30%, 85%)",
  "hsl(200, 30%, 75%)",
  "hsl(10, 60%, 70%)",
];

interface Roommate {
  id: number;
  username: string;
  color: string;
  choresThisWeek: number;
  dueToday: number;
  isYou: boolean;
}

const roommates: Roommate[] = [
  { id: 1, username: "alex_m", color: AVATAR_COLORS[0], choresThisWeek: 2, dueToday: 1, isYou: true },
  { id: 2, username: "jordan.k", color: AVATAR_COLORS[1], choresThisWeek: 2, dueToday: 0, isYou: false },
  { id: 3, username: "sam_w", color: AVATAR_COLORS[3], choresThisWeek: 1, dueToday: 1, isYou: false },
  { id: 4, username: "riley99", color: AVATAR_COLORS[4], choresThisWeek: 1, dueToday: 0, isYou: false },
  { id: 5, username: "casey.b", color: AVATAR_COLORS[2], choresThisWeek: 1, dueToday: 0, isYou: false },
];

const INVITE_CODE = "MAPLE-7X2K";

const Roomies = () => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(INVITE_CODE).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const totalChores = roommates.reduce((s, r) => s + r.choresThisWeek, 0);
  const totalDueToday = roommates.reduce((s, r) => s + r.dueToday, 0);
  const completedCount = 2;

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        <FadeIn>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Roomies</h1>
            <button
              onClick={() => setShowManage(!showManage)}
              className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Home className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Maple House</span>
            <span className="text-xs text-muted-foreground">· {roommates.length} members</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="rounded-2xl border border-border bg-card p-4 mb-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Invite code</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 text-base font-extrabold tracking-widest text-foreground text-center select-all">
                {INVITE_CODE}
              </div>
              <button
                onClick={copyCode}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                  codeCopied ? "bg-done/20 text-done" : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button className="w-full py-3 rounded-xl font-bold text-sm bg-primary/10 text-primary hover:bg-primary/15 transition-colors flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Share invite link
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="mb-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">This week at a glance</p>
            <div className="grid grid-cols-3 gap-2">
              <GlanceCard emoji="📋" value={totalChores} label="Total chores" />
              <GlanceCard emoji="⏳" value={totalDueToday} label="Due today" />
              <GlanceCard emoji="✅" value={completedCount} label="Completed" />
            </div>
          </div>
        </FadeIn>

        <div className="mb-5">
          <FadeIn delay={0.15}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Members</p>
          </FadeIn>
          <StaggerContainer className="flex flex-col gap-2.5">
            {roommates.map((r) => (
              <StaggerItem key={r.id}>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-foreground/80 flex-shrink-0"
                    style={{ backgroundColor: r.color }}
                  >
                    {r.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm truncate">@{r.username}</p>
                      {r.isYou && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-celery/30 text-primary">you</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.choresThisWeek} chore{r.choresThisWeek !== 1 ? "s" : ""} this week
                      {r.dueToday > 0 && ` · ${r.dueToday} due today`}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <AnimatePresence>
          {showManage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-5"
            >
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">House settings</p>
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <ManageRow icon={<Pencil className="w-4 h-4" />} label="Rename house" />
                <ManageRow icon={<Settings className="w-4 h-4" />} label="Manage invites" />
                <ManageRow icon={<LogOut className="w-4 h-4" />} label="Leave house" destructive last />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </PageTransition>
  );
};

function GlanceCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center">
      <span className="text-lg">{emoji}</span>
      <p className="text-xl font-extrabold mt-0.5">{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function ManageRow({ icon, label, destructive, last }: { icon: React.ReactNode; label: string; destructive?: boolean; last?: boolean }) {
  return (
    <button className={cn("w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/30 transition-colors", !last && "border-b border-border", destructive && "text-destructive")}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

export default Roomies;
