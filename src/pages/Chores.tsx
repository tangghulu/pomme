import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Users, ChevronRight, CalendarDays, Bell, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

interface ManagedChore {
  id: number;
  name: string;
  icon: string;
  frequency: string;
  frequencyLabel: string;
  assignedCount: number;
  nextDue: string;
  reminderTime: string;
  archived: boolean;
}

const allChores: ManagedChore[] = [
  { id: 1, name: "Take out garbage", icon: "🗑️", frequency: "weekly", frequencyLabel: "Every week", assignedCount: 1, nextDue: "Monday", reminderTime: "8:00 AM", archived: false },
  { id: 2, name: "Clean bathroom", icon: "🚿", frequency: "weekly", frequencyLabel: "Every week", assignedCount: 1, nextDue: "Tuesday", reminderTime: "9:00 AM", archived: false },
  { id: 3, name: "Kitchen cleanup", icon: "🍳", frequency: "weekly", frequencyLabel: "Every week", assignedCount: 2, nextDue: "Wednesday", reminderTime: "7:00 PM", archived: false },
  { id: 4, name: "Vacuum living room", icon: "🧹", frequency: "biweekly", frequencyLabel: "Every other week", assignedCount: 1, nextDue: "Thursday", reminderTime: "10:00 AM", archived: false },
  { id: 5, name: "Mop floors", icon: "🫧", frequency: "monthly", frequencyLabel: "Once a month", assignedCount: 2, nextDue: "Friday", reminderTime: "9:00 AM", archived: false },
  { id: 6, name: "Wipe counters", icon: "✨", frequency: "weekly", frequencyLabel: "Every week", assignedCount: 1, nextDue: "Saturday", reminderTime: "12:00 PM", archived: false },
  { id: 7, name: "Clean fridge", icon: "🧊", frequency: "monthly", frequencyLabel: "Once a month", assignedCount: 1, nextDue: "Mar 15", reminderTime: "10:00 AM", archived: true },
];

const Chores = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedChore, setSelectedChore] = useState<ManagedChore | null>(null);

  const filtered = allChores
    .filter((c) => (filter === "active" ? !c.archived : c.archived))
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold tracking-tight">Chores</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
            >
              <Search className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={() => navigate("/create")}
              className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chores..."
              autoFocus
              className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(["active", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-accent"
              )}
            >
              {f} ({allChores.filter((c) => (f === "active" ? !c.archived : c.archived)).length})
            </button>
          ))}
        </div>

        {/* Chore list */}
        <div className="flex flex-col gap-3">
          {filtered.map((chore) => (
            <button
              key={chore.id}
              onClick={() => setSelectedChore(chore)}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{chore.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{chore.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {chore.frequencyLabel}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {chore.assignedCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      Next: {chore.nextDue}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bell className="w-3 h-3" />
                      {chore.reminderTime}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                {search ? "No chores match your search" : "No chores here yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail sheet */}
      {selectedChore && (
        <ChoreDetailSheet chore={selectedChore} onClose={() => setSelectedChore(null)} />
      )}

      <BottomNav />
    </div>
  );
};

/* ─── Detail Sheet ─── */
function ChoreDetailSheet({ chore, onClose }: { chore: ManagedChore; onClose: () => void }) {
  const rows = [
    { label: "Frequency", value: chore.frequencyLabel, icon: "🔁" },
    { label: "People", value: `${chore.assignedCount} roommate${chore.assignedCount > 1 ? "s" : ""}`, icon: "👥" },
    { label: "Next due", value: chore.nextDue, icon: "📆" },
    { label: "Reminder", value: chore.reminderTime, icon: "⏰" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card rounded-t-3xl p-5 pb-10 animate-in slide-in-from-bottom duration-300">
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{chore.icon}</span>
            <div>
              <h2 className="text-xl font-extrabold">{chore.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {chore.archived ? "Archived" : "Active"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden mb-4">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between px-4 py-3.5",
                i < rows.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{row.icon}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase">{row.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-3 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
            Edit chore
          </button>
          <button className="py-3 px-5 rounded-2xl font-bold text-sm border border-border text-muted-foreground hover:bg-accent/40 transition-colors">
            {chore.archived ? "Restore" : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chores;
