import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Leaf, Copy, Check, Home, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScaleIn } from "@/components/motion";

const AVATAR_COLORS = [
  { name: "Sage", bg: "bg-sage", hsl: "hsl(110, 20%, 70%)" },
  { name: "Celery", bg: "bg-celery", hsl: "hsl(90, 35%, 75%)" },
  { name: "Oat", bg: "bg-oat", hsl: "hsl(35, 30%, 85%)" },
  { name: "Sky", bg: "bg-upcoming", hsl: "hsl(200, 30%, 75%)" },
  { name: "Peach", bg: "bg-overdue", hsl: "hsl(10, 60%, 70%)" },
  { name: "Sun", bg: "bg-streak", hsl: "hsl(45, 80%, 65%)" },
];

type HouseChoice = "create" | "join" | null;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [avatarColor, setAvatarColor] = useState(0);
  const [houseChoice, setHouseChoice] = useState<HouseChoice>(null);
  const [houseName, setHouseName] = useState("");
  const [roommateCount, setRoommateCount] = useState(3);
  const [inviteCode, setInviteCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  // Dynamic steps based on house choice
  const getSteps = () => {
    const base = ["welcome", "profile", "houseChoice"];
    if (houseChoice === "create") return [...base, "createHouse", "success"];
    if (houseChoice === "join") return [...base, "joinHouse", "success"];
    return base;
  };

  const steps = getSteps();
  const currentStep = steps[step];
  const totalSteps = steps.length;

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const canAdvance = () => {
    if (currentStep === "profile") return username.trim().length >= 2;
    if (currentStep === "houseChoice") return houseChoice !== null;
    if (currentStep === "createHouse") return houseName.trim().length >= 2;
    if (currentStep === "joinHouse") return inviteCode.trim().length >= 4;
    return true;
  };

  const generatedCode = "MAPLE-7X2K";

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-5 pt-6 pb-8">
        {/* Progress (hidden on welcome & success) */}
        {currentStep !== "welcome" && currentStep !== "success" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={back}
                className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-xs font-bold text-muted-foreground tracking-wide">
                STEP {step} OF {totalSteps - 2}
              </span>
              <div className="w-10" />
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((step) / (totalSteps - 2)) * 100}%` }}
              />
            </div>
          </>
        )}

        {/* Step content */}
        <div className="flex-1 flex flex-col">
          {currentStep === "welcome" && (
            <WelcomeStep onContinue={next} />
          )}
          {currentStep === "profile" && (
            <ProfileStep
              username={username}
              setUsername={setUsername}
              avatarColor={avatarColor}
              setAvatarColor={setAvatarColor}
            />
          )}
          {currentStep === "houseChoice" && (
            <HouseChoiceStep choice={houseChoice} setChoice={setHouseChoice} />
          )}
          {currentStep === "createHouse" && (
            <CreateHouseStep
              houseName={houseName}
              setHouseName={setHouseName}
              roommateCount={roommateCount}
              setRoommateCount={setRoommateCount}
              generatedCode={generatedCode}
              codeCopied={codeCopied}
              onCopyCode={copyCode}
            />
          )}
          {currentStep === "joinHouse" && (
            <JoinHouseStep inviteCode={inviteCode} setInviteCode={setInviteCode} />
          )}
          {currentStep === "success" && (
            <SuccessStep
              houseChoice={houseChoice!}
              houseName={houseChoice === "create" ? houseName : "Maple House"}
              username={username}
              avatarColor={avatarColor}
            />
          )}
        </div>

        {/* Bottom button (hidden on welcome) */}
        {currentStep !== "welcome" && (
          <div className="mt-6">
            {currentStep === "success" ? (
              <button
                onClick={() => navigate("/")}
                className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Let's go! <Sparkles className="w-4 h-4" />
              </button>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Welcome ─── */
function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <div className="w-20 h-20 rounded-3xl bg-celery/30 flex items-center justify-center mb-6">
        <Leaf className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight mb-3">
        Chore Harmony
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs mb-10">
        A calm way for roommates to share household chores — fair, simple, and stress-free.
      </p>

      <div className="w-full space-y-3">
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl font-bold text-base bg-foreground text-background flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl font-bold text-base border-2 border-border text-foreground flex items-center justify-center gap-2 hover:bg-accent/40 active:scale-[0.98] transition-all duration-200"
        >
          Create an account
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 mt-6 max-w-xs leading-relaxed">
        By continuing you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

/* ─── Profile ─── */
function ProfileStep({
  username,
  setUsername,
  avatarColor,
  setAvatarColor,
}: {
  username: string;
  setUsername: (v: string) => void;
  avatarColor: number;
  setAvatarColor: (v: number) => void;
}) {
  const initials = username.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Create your profile</h2>
        <p className="text-sm text-muted-foreground">Pick a username your roommates will see</p>
      </div>

      {/* Avatar preview */}
      <div className="flex justify-center">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-foreground/80 transition-colors duration-300 shadow-sm"
          style={{ backgroundColor: AVATAR_COLORS[avatarColor].hsl }}
        >
          {initials}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Pick a color
        </label>
        <div className="flex gap-3 justify-center">
          {AVATAR_COLORS.map((color, i) => (
            <button
              key={color.name}
              onClick={() => setAvatarColor(i)}
              className={cn(
                "w-10 h-10 rounded-xl transition-all duration-200",
                avatarColor === i && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
              )}
              style={{ backgroundColor: color.hsl }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Username */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. alex_m"
          maxLength={20}
          className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          2–20 characters, visible to your roommates
        </p>
      </div>
    </div>
  );
}

/* ─── House Choice ─── */
function HouseChoiceStep({
  choice,
  setChoice,
}: {
  choice: HouseChoice;
  setChoice: (v: HouseChoice) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Your house</h2>
        <p className="text-sm text-muted-foreground">Create a new house or join one that already exists</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setChoice("create")}
          className={cn(
            "w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200",
            choice === "create"
              ? "bg-primary/10 border-primary/30 shadow-sm"
              : "bg-card border-border hover:bg-accent/40"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-celery/30 flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">Create a house</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Set up a new space and invite your roommates</p>
          </div>
          {choice === "create" && <Check className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
        </button>

        <button
          onClick={() => setChoice("join")}
          className={cn(
            "w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200",
            choice === "join"
              ? "bg-primary/10 border-primary/30 shadow-sm"
              : "bg-card border-border hover:bg-accent/40"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-oat/60 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-warm-brown" />
          </div>
          <div>
            <h3 className="font-bold text-base">Join a house</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Got an invite code? Jump right in</p>
          </div>
          {choice === "join" && <Check className="w-5 h-5 text-primary ml-auto flex-shrink-0" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Create House ─── */
function CreateHouseStep({
  houseName,
  setHouseName,
  roommateCount,
  setRoommateCount,
  generatedCode,
  codeCopied,
  onCopyCode,
}: {
  houseName: string;
  setHouseName: (v: string) => void;
  roommateCount: number;
  setRoommateCount: (v: number) => void;
  generatedCode: string;
  codeCopied: boolean;
  onCopyCode: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Name your house</h2>
        <p className="text-sm text-muted-foreground">Something fun your roommates will recognize</p>
      </div>

      {/* House name */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          House name
        </label>
        <input
          type="text"
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          placeholder="e.g. Maple House"
          maxLength={30}
          className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <div className="flex gap-2 mt-3 flex-wrap">
          {["Maple House", "Cozy Corner", "The Nest"].map((hint) => (
            <button
              key={hint}
              onClick={() => setHouseName(hint)}
              className="text-xs px-3 py-1.5 rounded-full bg-accent/60 text-accent-foreground font-semibold hover:bg-accent transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Roommate count */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          How many roommates? (optional)
        </label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setRoommateCount(n)}
              className={cn(
                "w-12 h-12 rounded-2xl font-bold text-base transition-all duration-200",
                roommateCount === n
                  ? "bg-primary text-primary-foreground shadow-sm scale-110"
                  : "bg-muted/60 text-muted-foreground hover:bg-accent"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Invite code */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Invite code
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Share this code with your roommates so they can join
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl bg-muted/50 text-lg font-extrabold tracking-widest text-foreground text-center select-all">
            {generatedCode}
          </div>
          <button
            onClick={onCopyCode}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              codeCopied
                ? "bg-done/20 text-done"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Join House ─── */
function JoinHouseStep({
  inviteCode,
  setInviteCode,
}: {
  inviteCode: string;
  setInviteCode: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Join a house</h2>
        <p className="text-sm text-muted-foreground">Enter the invite code your roommate shared with you</p>
      </div>

      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
          Invite code
        </label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="e.g. MAPLE-7X2K"
          maxLength={15}
          className="w-full px-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-xl font-extrabold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase"
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Ask your roommate for the code — it looks like <span className="font-bold">MAPLE-7X2K</span>
        </p>
      </div>

      <div className="rounded-2xl bg-celery/15 border border-celery/25 p-4 flex items-start gap-3">
        <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          Once you join, you'll see the house's shared chores and can start pitching in right away.
        </p>
      </div>
    </div>
  );
}

/* ─── Success ─── */
function SuccessStep({
  houseChoice,
  houseName,
  username,
  avatarColor,
}: {
  houseChoice: "create" | "join";
  houseName: string;
  username: string;
  avatarColor: number;
}) {
  const initials = username.trim().slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-foreground/80 shadow-sm mb-4"
        style={{ backgroundColor: AVATAR_COLORS[avatarColor].hsl }}
      >
        {initials}
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight mb-2">
        {houseChoice === "create" ? "House created!" : "You're in!"}
      </h2>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs mb-2">
        {houseChoice === "create"
          ? `Welcome to ${houseName}! Share the invite code so your roommates can join.`
          : `You've joined ${houseName}. Time to see what chores are waiting!`
        }
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 w-full max-w-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-celery/30 flex items-center justify-center">
            <Home className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm">{houseName}</p>
            <p className="text-xs text-muted-foreground">
              {houseChoice === "create" ? "You're the host" : "Member"}
              {" · @"}{username}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
