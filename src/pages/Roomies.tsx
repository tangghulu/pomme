import { useState } from "react";
import { Copy, Check, Share2, Home, Settings, ChevronRight, LogOut, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useHouse, useHouseMembers, useInviteCode, useChores, useChoreAssignments } from "@/hooks/useHouse";
import { useAuth } from "@/contexts/AuthContext";

const AVATAR_COLORS = [
  "hsl(110, 20%, 70%)", "hsl(90, 35%, 75%)", "hsl(35, 30%, 85%)",
  "hsl(200, 30%, 75%)", "hsl(10, 60%, 70%)",
];

const Roomies = () => {
  const { user } = useAuth();
  const { data: house } = useHouse();
  const { data: members = [] } = useHouseMembers();
  const { data: inviteCode } = useInviteCode();
  const { data: chores = [] } = useChores();
  const { data: assignments = [] } = useChoreAssignments();
  const [codeCopied, setCodeCopied] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const code = inviteCode?.code || "—";

  const copyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const totalChores = chores.filter((c: any) => !c.archived).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const totalDueToday = assignments.filter((a: any) => a.due_date === todayStr && a.status !== "done").length;
  const completedCount = assignments.filter((a: any) => a.status === "done").length;

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        <FadeIn>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Roomies</h1>
            <button onClick={() => setShowManage(!showManage)} className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors">
              <Settings className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Home className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">{house?.name || "My House"}</span>
            <span className="text-xs text-muted-foreground">· {members.length} member{members.length !== 1 ? "s" : ""}</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="rounded-2xl border border-border bg-card p-4 mb-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Invite code</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 text-base font-extrabold tracking-widest text-foreground text-center select-all">{code}</div>
              <button onClick={copyCode} className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200", codeCopied ? "bg-done/20 text-done" : "bg-primary/10 text-primary hover:bg-primary/20")}>
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
            {members.map((m: any, i: number) => (
              <StaggerItem key={m.id}>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-foreground/80 flex-shrink-0" style={{ backgroundColor: m.profiles?.avatar_color || AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {(m.profiles?.username || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm truncate">@{m.profiles?.username || "unknown"}</p>
                      {m.isYou && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-celery/30 text-primary">you</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.role === "admin" ? "Admin" : "Member"}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <AnimatePresence>
          {showManage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden mb-5">
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
      <div className="flex items-center gap-3">{icon}<span className="text-sm font-semibold">{label}</span></div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

export default Roomies;
