import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollTimePicker from "@/components/ScrollTimePicker";
import { ArrowLeft, ArrowRight, Check, Clock, Users, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useHouse } from "@/hooks/useHouse";
import { createChore } from "@/lib/houseActions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const TOTAL_STEPS = 4;

const weekDays = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

const frequencies = [
  { value: "weekly", label: "Every week", emoji: "🔁" },
  { value: "biweekly", label: "Every other week", emoji: "📅" },
  { value: "monthly", label: "Once a month", emoji: "🗓️" },
];

const choreIcons = ["🗑️", "🚿", "🍳", "🧹", "🫧", "✨", "🧊", "🧺", "🪣", "📋"];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const CreateChore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: house } = useHouse();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [choreName, setChoreName] = useState("");
  const [choreIcon, setChoreIcon] = useState("📋");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("weekly");
  
  const [peopleNeeded, setPeopleNeeded] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const canAdvance = () => {
    if (step === 0) return choreName.trim().length > 0;
    if (step === 1) return selectedDays.length > 0;
    return true;
  };

  const next = () => { if (step < TOTAL_STEPS - 1) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); else navigate("/"); };

  const handleCreate = async () => {
    if (!user || !house) return;
    setLoading(true);
    try {
      await createChore({
        house_id: house.id,
        name: choreName,
        icon: choreIcon,
        frequency,
        days: selectedDays,
        reminder_time: reminderTime,
        people_needed: peopleNeeded,
        auto_rotate: autoRotate,
        created_by: user.id,
      });
      queryClient.invalidateQueries({ queryKey: ["chores"] });
      toast({ title: "Chore created!", description: `${choreName} has been added.` });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not create chore", variant: "destructive" });
    }
    setLoading(false);
  };

  const stepTitles = ["What's the chore?", "When & how often?", "Who & how?", "Looking good! 🎉"];
  const stepSubtitles = ["Give it a name and pick the days", "Set the frequency and reminder", "Decide how many people and rotation", "Here's a summary of your new chore"];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-5 pt-5 pb-8">
        <div className="flex items-center justify-between mb-2">
          <button onClick={back} className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <span className="text-xs font-bold text-muted-foreground tracking-wide">STEP {step + 1} OF {TOTAL_STEPS}</span>
          <div className="w-10" />
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">{stepTitles[step]}</h1>
            <p className="text-sm text-muted-foreground mb-6">{stepSubtitles[step]}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              {step === 0 && <StepNameAndDays choreName={choreName} setChoreName={setChoreName} choreIcon={choreIcon} setChoreIcon={setChoreIcon} selectedDays={selectedDays} toggleDay={toggleDay} />}
              {step === 1 && <StepFrequencyAndTime frequency={frequency} setFrequency={setFrequency} reminderTime={reminderTime} setReminderTime={setReminderTime} />}
              {step === 2 && <StepPeopleAndRotation peopleNeeded={peopleNeeded} setPeopleNeeded={setPeopleNeeded} autoRotate={autoRotate} setAutoRotate={setAutoRotate} />}
              {step === 3 && <StepReview choreName={choreName} choreIcon={choreIcon} selectedDays={selectedDays} frequency={frequency} reminderTime={reminderTime} peopleNeeded={peopleNeeded} autoRotate={autoRotate} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6">
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={next} disabled={!canAdvance()} className={cn("w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200", canAdvance() ? "bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98]" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> {loading ? "Creating..." : "Create Chore"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function StepNameAndDays({ choreName, setChoreName, choreIcon, setChoreIcon, selectedDays, toggleDay }: { choreName: string; setChoreName: (v: string) => void; choreIcon: string; setChoreIcon: (v: string) => void; selectedDays: string[]; toggleDay: (d: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Chore name</label>
        <input type="text" value={choreName} onChange={(e) => setChoreName(e.target.value)} placeholder="e.g. Take out garbage" className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        <div className="flex gap-2 mt-3 flex-wrap">
          {["Take out garbage", "Clean bathroom", "Vacuum"].map((hint) => (
            <button key={hint} onClick={() => setChoreName(hint)} className="text-xs px-3 py-1.5 rounded-full bg-accent/60 text-accent-foreground font-semibold hover:bg-accent transition-colors">{hint}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Icon</label>
        <div className="flex gap-2 flex-wrap">
          {choreIcons.map((icon) => (
            <button key={icon} onClick={() => setChoreIcon(icon)} className={cn("w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all", choreIcon === icon ? "bg-primary/20 ring-2 ring-primary scale-110" : "bg-muted/60 hover:bg-accent")}>{icon}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Which day(s)?</label>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(({ short, full }) => (
            <button key={short} onClick={() => toggleDay(full)} className={cn("py-3 rounded-xl text-xs font-bold transition-all duration-200", selectedDays.includes(full) ? "bg-primary text-primary-foreground shadow-sm scale-105" : "bg-muted/60 text-muted-foreground hover:bg-accent")}>{short}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepFrequencyAndTime({ frequency, setFrequency, reminderTime, setReminderTime }: { frequency: string; setFrequency: (v: string) => void; reminderTime: string; setReminderTime: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">How often?</label>
        <div className="space-y-2">
          {frequencies.map((f) => (
            <button key={f.value} onClick={() => setFrequency(f.value)} className={cn("w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200", frequency === f.value ? "bg-primary/10 border-primary/30 shadow-sm" : "bg-card border-border hover:bg-accent/40")}>
              <span className="text-xl">{f.emoji}</span>
              <span className={cn("font-semibold text-sm", frequency === f.value ? "text-foreground" : "text-muted-foreground")}>{f.label}</span>
              {frequency === f.value && <Check className="w-4 h-4 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Reminder time</label>
        <ScrollTimePicker value={reminderTime} onChange={setReminderTime} />
      </div>
    </div>
  );
}

function StepPeopleAndRotation({ peopleNeeded, setPeopleNeeded, autoRotate, setAutoRotate }: { peopleNeeded: number; setPeopleNeeded: (v: number) => void; autoRotate: boolean; setAutoRotate: (v: boolean) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> People needed</label>
        <p className="text-xs text-muted-foreground mb-3">How many roommates should handle this chore each time?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setPeopleNeeded(n)} className={cn("w-12 h-12 rounded-2xl font-bold text-base transition-all duration-200", peopleNeeded === n ? "bg-primary text-primary-foreground shadow-sm scale-110" : "bg-muted/60 text-muted-foreground hover:bg-accent")}>{n}</button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-celery/30 flex items-center justify-center flex-shrink-0 mt-0.5"><RefreshCw className="w-5 h-5 text-primary" /></div>
            <div>
              <h3 className="font-bold text-sm">Auto-rotation</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Automatically rotate this chore among roommates each cycle.</p>
            </div>
          </div>
          <button onClick={() => setAutoRotate(!autoRotate)} className={cn("w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300 flex-shrink-0 mt-1", autoRotate ? "bg-primary" : "bg-muted")}>
            <div className={cn("w-6 h-6 bg-card rounded-full shadow-sm transition-transform duration-300", autoRotate ? "translate-x-5" : "translate-x-0")} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StepReview({ choreName, choreIcon, selectedDays, frequency, reminderTime, peopleNeeded, autoRotate }: { choreName: string; choreIcon: string; selectedDays: string[]; frequency: string; reminderTime: string; peopleNeeded: number; autoRotate: boolean }) {
  const freqLabel = frequencies.find((f) => f.value === frequency)?.label || frequency;
  const rows = [
    { label: "Chore", value: `${choreIcon} ${choreName}`, icon: "✏️" },
    { label: "Days", value: selectedDays.join(", "), icon: "📆" },
    { label: "Frequency", value: freqLabel, icon: "🔁" },
    { label: "Reminder", value: reminderTime, icon: "⏰" },
    { label: "People", value: `${peopleNeeded} roommate${peopleNeeded > 1 ? "s" : ""}`, icon: "👥" },
    { label: "Auto-rotate", value: autoRotate ? "On" : "Off", icon: "🔄" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {rows.map((row, i) => (
        <div key={row.label} className={cn("flex items-center justify-between px-4 py-3.5", i < rows.length - 1 && "border-b border-border")}>
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{row.icon}</span>
            <span className="text-xs font-bold text-muted-foreground uppercase">{row.label}</span>
          </div>
          <span className="text-sm font-semibold text-foreground text-right max-w-[55%] truncate">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default CreateChore;
