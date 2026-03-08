import { useState } from "react";
import { Plus, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import ChoreCard, { type ChoreStatus } from "@/components/ChoreCard";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

interface Chore {
  id: number;
  name: string;
  assignee: string;
  dueDay: string;
  status: ChoreStatus;
  icon: string;
}

const initialChores: Chore[] = [
  { id: 1, name: "Take out garbage", assignee: "Alex", dueDay: "Monday", status: "done", icon: "🗑️" },
  { id: 2, name: "Clean bathroom", assignee: "Jordan", dueDay: "Tuesday", status: "overdue", icon: "🚿" },
  { id: 3, name: "Kitchen cleanup", assignee: "Sam", dueDay: "Wednesday", status: "upcoming", icon: "🍳" },
  { id: 4, name: "Vacuum living room", assignee: "Riley", dueDay: "Thursday", status: "upcoming", icon: "🧹" },
  { id: 5, name: "Mop floors", assignee: "Casey", dueDay: "Friday", status: "upcoming", icon: "🫧" },
  { id: 6, name: "Wipe counters", assignee: "Alex", dueDay: "Saturday", status: "upcoming", icon: "✨" },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = 2; // Wednesday (0-indexed)

const Index = () => {
  const [chores, setChores] = useState<Chore[]>(initialChores);

  const markDone = (id: number) => {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "done" as ChoreStatus } : c))
    );
  };

  const doneCount = chores.filter((c) => c.status === "done").length;
  const streak = 5;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">🏠 Maple House</h1>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-4 h-4 text-streak" />
              <span className="text-xs font-semibold text-muted-foreground">
                {streak}-day streak
              </span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center justify-between mb-4">
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-sm font-bold">This Week</p>
            <p className="text-xs text-muted-foreground">Mar 3 – Mar 9, 2026</p>
          </div>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Day Pills */}
        <div className="flex gap-1.5 mb-6 justify-between">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={cn(
                "flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors",
                i === today
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : i < today
                  ? "bg-accent/60 text-muted-foreground"
                  : "bg-muted/50 text-muted-foreground"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Week progress
            </span>
            <span className="text-xs font-bold text-primary">
              {doneCount}/{chores.length} done
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / chores.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chore Cards */}
        <div className="flex flex-col gap-3">
          {chores.map((chore) => (
            <ChoreCard
              key={chore.id}
              name={chore.name}
              assignee={chore.assignee}
              dueDay={chore.dueDay}
              status={chore.status}
              icon={chore.icon}
              onMarkDone={() => markDone(chore.id)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
