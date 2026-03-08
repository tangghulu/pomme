import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock, Users, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

const timeSlots = [
  "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
  "12:00 PM", "2:00 PM", "5:00 PM", "7:00 PM", "9:00 PM",
];

const CreateChore = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [choreName, setChoreName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("weekly");
  const [reminderTime, setReminderTime] = useState("9:00 AM");
  const [peopleNeeded, setPeopleNeeded] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const canAdvance = () => {
    if (step === 0) return choreName.trim().length > 0;
    if (step === 1) return selectedDays.length > 0;
    return true;
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/");
  };

  const handleCreate = () => {
    navigate("/");
  };

  const stepTitles = [
    "What's the chore?",
    "When & how often?",
    "Who & how?",
    "Looking good! 🎉",
  ];

  const stepSubtitles = [
    "Give it a name and pick the days",
    "Set the frequency and reminder",
    "Decide how many people and rotation",
    "Here's a summary of your new chore",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-5 pt-5 pb-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={back}
            className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-xs font-bold text-muted-foreground tracking-wide">
            STEP {step + 1} OF {TOTAL_STEPS}
          </span>
          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">{stepTitles[step]}</h1>
        <p className="text-sm text-muted-foreground mb-6">{stepSubtitles[step]}</p>

        {/* Step content */}
        <div className="flex-1">
          {step === 0 && (
            <StepNameAndDays
              choreName={choreName}
              setChoreName={setChoreName}
              selectedDays={selectedDays}
              toggleDay={toggleDay}
            />
          )}
          {step === 1 && (
            <StepFrequencyAndTime
              frequency={frequency}
              setFrequency={setFrequency}
              reminderTime={reminderTime}
              setReminderTime={setReminderTime}
            />
          )}
          {step === 2 && (
            <StepPeopleAndRotation
              peopleNeeded={peopleNeeded}
              setPeopleNeeded={setPeopleNeeded}
              autoRotate={autoRotate}
              setAutoRotate={setAutoRotate}
            />
          )}
          {step === 3 && (
            <StepReview
              choreName={choreName}
              selectedDays={selectedDays}
              frequency={frequency}
              reminderTime={reminderTime}
              peopleNeeded={peopleNeeded}
              autoRotate={autoRotate}
            />
          )}
        </div>

        {/* Bottom button */}
        <div className="mt-6">
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={next}
              disabled={!canAdvance()}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200",
                canAdvance()
                  ? "bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Create Chore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Step 0: Name + Days ─── */
function StepNameAndDays({
  choreName,
  setChoreName,
  selectedDays,
  toggleDay,
}: {
  choreName: string;
  setChoreName: (v: string) => void;
  selectedDays: string[];
  toggleDay: (d: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Chore name */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Chore name
        </label>
        <input
          type="text"
          value={choreName}
          onChange={(e) => setChoreName(e.target.value)}
          placeholder="e.g. Take out garbage"
          className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <div className="flex gap-2 mt-3 flex-wrap">
          {["Take out garbage", "Clean bathroom", "Vacuum"].map((hint) => (
            <button
              key={hint}
              onClick={() => setChoreName(hint)}
              className="text-xs px-3 py-1.5 rounded-full bg-accent/60 text-accent-foreground font-semibold hover:bg-accent transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Day picker */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Which day(s)?
        </label>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map(({ short, full }) => (
            <button
              key={short}
              onClick={() => toggleDay(full)}
              className={cn(
                "py-3 rounded-xl text-xs font-bold transition-all duration-200",
                selectedDays.includes(full)
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-muted/60 text-muted-foreground hover:bg-accent"
              )}
            >
              {short}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Frequency + Reminder ─── */
function StepFrequencyAndTime({
  frequency,
  setFrequency,
  reminderTime,
  setReminderTime,
}: {
  frequency: string;
  setFrequency: (v: string) => void;
  reminderTime: string;
  setReminderTime: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Frequency */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          How often?
        </label>
        <div className="space-y-2">
          {frequencies.map((f) => (
            <button
              key={f.value}
              onClick={() => setFrequency(f.value)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200",
                frequency === f.value
                  ? "bg-primary/10 border-primary/30 shadow-sm"
                  : "bg-card border-border hover:bg-accent/40"
              )}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className={cn("font-semibold text-sm", frequency === f.value ? "text-foreground" : "text-muted-foreground")}>
                {f.label}
              </span>
              {frequency === f.value && (
                <Check className="w-4 h-4 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder time */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Reminder time
        </label>
        <div className="flex flex-wrap gap-2">
          {timeSlots.map((t) => (
            <button
              key={t}
              onClick={() => setReminderTime(t)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200",
                reminderTime === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-accent"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: People + Rotation ─── */
function StepPeopleAndRotation({
  peopleNeeded,
  setPeopleNeeded,
  autoRotate,
  setAutoRotate,
}: {
  peopleNeeded: number;
  setPeopleNeeded: (v: number) => void;
  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* People needed */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> People needed
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          How many roommates should handle this chore each time?
        </p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setPeopleNeeded(n)}
              className={cn(
                "w-12 h-12 rounded-2xl font-bold text-base transition-all duration-200",
                peopleNeeded === n
                  ? "bg-primary text-primary-foreground shadow-sm scale-110"
                  : "bg-muted/60 text-muted-foreground hover:bg-accent"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-rotation */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-celery/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Auto-rotation</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Automatically rotate this chore among roommates each cycle so no one gets stuck.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={cn(
              "w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300 flex-shrink-0 mt-1",
              autoRotate ? "bg-primary" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 bg-card rounded-full shadow-sm transition-transform duration-300",
                autoRotate ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Review ─── */
function StepReview({
  choreName,
  selectedDays,
  frequency,
  reminderTime,
  peopleNeeded,
  autoRotate,
}: {
  choreName: string;
  selectedDays: string[];
  frequency: string;
  reminderTime: string;
  peopleNeeded: number;
  autoRotate: boolean;
}) {
  const freqLabel = frequencies.find((f) => f.value === frequency)?.label || frequency;

  const rows = [
    { label: "Chore", value: choreName, icon: "✏️" },
    { label: "Days", value: selectedDays.join(", "), icon: "📆" },
    { label: "Frequency", value: freqLabel, icon: "🔁" },
    { label: "Reminder", value: reminderTime, icon: "⏰" },
    { label: "People", value: `${peopleNeeded} roommate${peopleNeeded > 1 ? "s" : ""}`, icon: "👥" },
    { label: "Auto-rotate", value: autoRotate ? "On" : "Off", icon: "🔄" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
          <span className="text-sm font-semibold text-foreground text-right max-w-[55%] truncate">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default CreateChore;
