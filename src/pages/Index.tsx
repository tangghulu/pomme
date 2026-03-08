import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import ChoreCard, { type ChoreStatus } from "@/components/ChoreCard";
import BottomNav from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useHouse, useChores, useChoreAssignments, useHouseMembers } from "@/hooks/useHouse";
import { useAuth } from "@/contexts/AuthContext";
import { markAssignmentDone } from "@/lib/houseActions";
import { useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, parseISO } from "date-fns";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: house } = useHouse();
  const { data: chores = [] } = useChores();
  const { data: assignments = [] } = useChoreAssignments();
  const { data: members = [] } = useHouseMembers();
  const [weekOffset, setWeekOffset] = useState(0);

  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // Mon=0
  const weekStart = startOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addWeeks(now, weekOffset), { weekStartsOn: 1 });

  // Filter assignments for current week
  const weekAssignments = assignments.filter((a: any) => {
    try {
      const d = parseISO(a.due_date);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch { return false; }
  });

  const choreItems = weekAssignments.map((a: any) => {
    const chore = a.chores || chores.find((c: any) => c.id === a.chore_id);
    const profile = a.profiles || members.find((m: any) => m.user_id === a.user_id)?.profiles;
    return {
      id: a.id,
      name: chore?.name || "Chore",
      assignee: profile?.username || "Unknown",
      dueDay: a.due_date ? format(parseISO(a.due_date), "EEEE") : "",
      status: a.status as ChoreStatus,
      icon: chore?.icon || "📋",
    };
  });

  // If no assignments exist yet, show chores as upcoming placeholders
  const displayItems = choreItems.length > 0 ? choreItems : chores.filter((c: any) => !c.archived).map((c: any) => ({
    id: c.id,
    name: c.name,
    assignee: "Unassigned",
    dueDay: (c.days?.[0] || ""),
    status: "upcoming" as ChoreStatus,
    icon: c.icon,
  }));

  const doneCount = displayItems.filter((c) => c.status === "done").length;
  const streak = 0; // TODO: calculate real streak

  const handleMarkDone = async (id: string) => {
    try {
      await markAssignmentDone(id);
      queryClient.invalidateQueries({ queryKey: ["chore_assignments"] });
    } catch {}
  };

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">🏠 {house?.name || "My House"}</h1>
              {streak > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-streak" />
                  <span className="text-xs font-semibold text-muted-foreground">{streak}-day streak</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/create")}
              className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-sm font-bold">{weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : weekOffset === 1 ? "Next Week" : `Week of ${format(weekStart, "MMM d")}`}</p>
              <p className="text-xs text-muted-foreground">{format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}</p>
            </div>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex gap-1.5 mb-6 justify-between">
            {weekDays.map((day, i) => (
              <div key={day} className={cn("flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors", weekOffset === 0 && i === todayIndex ? "bg-primary text-primary-foreground shadow-sm" : i < todayIndex && weekOffset === 0 ? "bg-accent/60 text-muted-foreground" : "bg-muted/50 text-muted-foreground")}>{day}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Week progress</span>
              <span className="text-xs font-bold text-primary">{doneCount}/{displayItems.length} done</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: displayItems.length > 0 ? `${(doneCount / displayItems.length) * 100}%` : "0%" }} />
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="flex flex-col gap-3">
          {displayItems.map((chore) => (
            <StaggerItem key={chore.id}>
              <ChoreCard name={chore.name} assignee={chore.assignee} dueDay={chore.dueDay} status={chore.status} icon={chore.icon} onMarkDone={() => handleMarkDone(chore.id)} />
            </StaggerItem>
          ))}
          {displayItems.length === 0 && (
            <StaggerItem>
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🎉</p>
                <p className="text-sm font-semibold text-muted-foreground">No chores yet</p>
                <p className="text-xs text-muted-foreground mt-1">Tap + to create your first chore</p>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>
      <BottomNav />
    </PageTransition>
  );
};

export default Index;
