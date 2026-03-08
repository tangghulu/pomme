import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Clock, Users, ChevronRight, CalendarDays, Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useChores } from "@/hooks/useHouse";
import { updateChore } from "@/lib/houseActions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const frequencyLabels: Record<string, string> = {
  daily: "Every day",
  weekly: "Every week",
  biweekly: "Every other week",
  monthly: "Once a month",
};

const ICONS = ["📋", "🗑️", "🧹", "🍽️", "🧺", "🚿", "🛒", "🐕", "🌱", "📦", "🔧", "🧽"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Chores = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: allChores = [] } = useChores();
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedChore, setSelectedChore] = useState<any>(null);
  const [editingChore, setEditingChore] = useState<any>(null);

  const filtered = allChores
    .filter((c: any) => (filter === "active" ? !c.archived : c.archived))
    .filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  const activeCount = allChores.filter((c: any) => !c.archived).length;
  const archivedCount = allChores.filter((c: any) => c.archived).length;

  const handleArchiveToggle = async (chore: any) => {
    try {
      await updateChore(chore.id, { archived: !chore.archived });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({ title: chore.archived ? "Chore restored" : "Chore archived" });
      setSelectedChore(null);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleEdit = (chore: any) => {
    setSelectedChore(null);
    setEditingChore({ ...chore });
  };

  const handleSaveEdit = async () => {
    if (!editingChore) return;
    try {
      await updateChore(editingChore.id, {
        name: editingChore.name,
        icon: editingChore.icon,
        frequency: editingChore.frequency,
        days: editingChore.days,
        reminder_time: editingChore.reminder_time,
        people_needed: editingChore.people_needed,
        auto_rotate: editingChore.auto_rotate,
      });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({ title: "Chore updated" });
      setEditingChore(null);
    } catch {
      toast({ title: "Error", description: "Could not update chore", variant: "destructive" });
    }
  };

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        <FadeIn>
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-extrabold tracking-tight">Chores</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors">
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button onClick={() => navigate("/create")} className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </FadeIn>

        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mb-4">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chores..." autoFocus className="w-full px-4 py-3 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </motion.div>
          )}
        </AnimatePresence>

        <FadeIn delay={0.05}>
          <div className="flex gap-2 mb-5">
            {(["active", "archived"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-200", filter === f ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-accent")}>
                {f} ({f === "active" ? activeCount : archivedCount})
              </button>
            ))}
          </div>
        </FadeIn>

        <StaggerContainer className="flex flex-col gap-3">
          {filtered.map((chore: any) => (
            <StaggerItem key={chore.id}>
              <button onClick={() => setSelectedChore(chore)} className="w-full rounded-2xl border border-border bg-card p-4 text-left hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{chore.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{chore.name}</h3>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{frequencyLabels[chore.frequency] || chore.frequency}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="w-3 h-3" />{chore.people_needed}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="w-3 h-3" />{(chore.days || []).join(", ") || "—"}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Bell className="w-3 h-3" />{chore.reminder_time}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </button>
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <StaggerItem>
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">{search ? "No chores match your search" : "No chores here yet"}</p>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>

      <AnimatePresence>
        {selectedChore && (
          <ChoreDetailSheet
            chore={selectedChore}
            onClose={() => setSelectedChore(null)}
            onEdit={() => handleEdit(selectedChore)}
            onArchiveToggle={() => handleArchiveToggle(selectedChore)}
          />
        )}
        {editingChore && (
          <ChoreEditSheet
            chore={editingChore}
            onChange={setEditingChore}
            onClose={() => setEditingChore(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </PageTransition>
  );
};

function ChoreDetailSheet({ chore, onClose, onEdit, onArchiveToggle }: { chore: any; onClose: () => void; onEdit: () => void; onArchiveToggle: () => void }) {
  const rows = [
    { label: "Frequency", value: frequencyLabels[chore.frequency] || chore.frequency, icon: "🔁" },
    { label: "People", value: `${chore.people_needed} roommate${chore.people_needed > 1 ? "s" : ""}`, icon: "👥" },
    { label: "Days", value: (chore.days || []).join(", ") || "—", icon: "📆" },
    { label: "Reminder", value: chore.reminder_time, icon: "⏰" },
    { label: "Auto-rotate", value: chore.auto_rotate ? "On" : "Off", icon: "🔄" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="relative w-full max-w-md bg-card rounded-t-3xl p-5 pb-10">
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{chore.icon}</span>
            <div>
              <h2 className="text-xl font-extrabold">{chore.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{chore.archived ? "Archived" : "Active"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="rounded-2xl border border-border overflow-hidden mb-4">
          {rows.map((row, i) => (
            <div key={row.label} className={cn("flex items-center justify-between px-4 py-3.5", i < rows.length - 1 && "border-b border-border")}>
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{row.icon}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase">{row.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">Edit chore</button>
          <button onClick={onArchiveToggle} className="py-3 px-5 rounded-2xl font-bold text-sm border border-border text-muted-foreground hover:bg-accent/40 transition-colors">{chore.archived ? "Restore" : "Archive"}</button>
        </div>
      </motion.div>
    </div>
  );
}

function ChoreEditSheet({ chore, onChange, onClose, onSave }: { chore: any; onChange: (c: any) => void; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    const days = chore.days || [];
    onChange({ ...chore, days: days.includes(day) ? days.filter((d: string) => d !== day) : [...days, day] });
  };

  const save = async () => {
    setLoading(true);
    await onSave();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="relative w-full max-w-md bg-card rounded-t-3xl p-5 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">Edit chore</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Icon */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((icon) => (
                <button key={icon} onClick={() => onChange({ ...chore, icon })} className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all", chore.icon === icon ? "bg-primary/15 ring-2 ring-primary scale-110" : "bg-muted/50 hover:bg-accent")}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Name</label>
            <input type="text" value={chore.name} onChange={(e) => onChange({ ...chore, name: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-foreground text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Frequency</label>
            <div className="flex gap-2 flex-wrap">
              {["daily", "weekly", "biweekly", "monthly"].map((f) => (
                <button key={f} onClick={() => onChange({ ...chore, frequency: f })} className={cn("px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all", chore.frequency === f ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-accent")}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Days */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Days</label>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <button key={day} onClick={() => toggleDay(day)} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", (chore.days || []).includes(day) ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-accent")}>
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* People needed */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">People needed</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} onClick={() => onChange({ ...chore, people_needed: n })} className={cn("w-10 h-10 rounded-xl text-sm font-bold transition-all", chore.people_needed === n ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-accent")}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-rotate */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Auto-rotate</span>
            <button onClick={() => onChange({ ...chore, auto_rotate: !chore.auto_rotate })} className={cn("w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300", chore.auto_rotate ? "bg-primary" : "bg-muted")}>
              <div className={cn("w-6 h-6 bg-card rounded-full shadow-sm transition-transform duration-300", chore.auto_rotate ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>
        </div>

        <button onClick={save} disabled={loading || !chore.name.trim()} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all mt-5 disabled:opacity-50">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </motion.div>
    </div>
  );
}

export default Chores;
