import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Leaf, Copy, Check, Home, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScaleIn } from "@/components/motion";
import { useAuth } from "@/contexts/AuthContext";
import { createHouse, joinHouseByCode, updateProfile } from "@/lib/houseActions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const AVATAR_COLORS = [
  { name: "Sage", hsl: "hsl(110, 20%, 70%)" },
  { name: "Celery", hsl: "hsl(90, 35%, 75%)" },
  { name: "Oat", hsl: "hsl(35, 30%, 85%)" },
  { name: "Sky", hsl: "hsl(200, 30%, 75%)" },
  { name: "Peach", hsl: "hsl(10, 60%, 70%)" },
  { name: "Sun", hsl: "hsl(45, 80%, 65%)" },
];

type HouseChoice = "create" | "join" | null;

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(user?.user_metadata?.username || user?.email?.split("@")[0] || "");
  const [avatarColor, setAvatarColor] = useState(0);
  const [houseChoice, setHouseChoice] = useState<HouseChoice>(null);
  const [houseName, setHouseName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSteps = () => {
    const base = ["profile", "houseChoice"];
    if (houseChoice === "create") return [...base, "createHouse", "success"];
    if (houseChoice === "join") return [...base, "joinHouse", "success"];
    return base;
  };

  const steps = getSteps();
  const currentStep = steps[step];
  const totalSteps = steps.length;

  const next = async () => {
    // Save profile when leaving profile step
    if (currentStep === "profile" && user) {
      setLoading(true);
      try {
        await updateProfile(user.id, { username, avatar_color: AVATAR_COLORS[avatarColor].hsl });
      } catch (e) {
        toast({ title: "Error", description: "Could not save profile", variant: "destructive" });
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Create house when leaving createHouse step
    if (currentStep === "createHouse" && user) {
      setLoading(true);
      try {
        const { code } = await createHouse(houseName, user.id);
        setGeneratedCode(code);
      } catch (e: any) {
        toast({ title: "Error", description: e.message || "Could not create house", variant: "destructive" });
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Join house when leaving joinHouse step
    if (currentStep === "joinHouse" && user) {
      setLoading(true);
      try {
        await joinHouseByCode(inviteCode, user.id);
      } catch (e: any) {
        toast({ title: "Error", description: e.message || "Could not join house", variant: "destructive" });
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (step < totalSteps - 1) setStep(step + 1);
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  const canAdvance = () => {
    if (currentStep === "profile") return username.trim().length >= 2;
    if (currentStep === "houseChoice") return houseChoice !== null;
    if (currentStep === "createHouse") return houseName.trim().length >= 2;
    if (currentStep === "joinHouse") return inviteCode.trim().length >= 4;
    return true;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode).catch(() => {});
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const finish = () => {
    queryClient.invalidateQueries({ queryKey: ["house"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    navigate("/");
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-2">
          <button onClick={back} disabled={step === 0} className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-xs font-bold text-muted-foreground tracking-wide">
            STEP {step + 1} OF {totalSteps}
          </span>
          <div className="w-10" />
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex-1 flex flex-col">
              {currentStep === "profile" && <ProfileStep username={username} setUsername={setUsername} avatarColor={avatarColor} setAvatarColor={setAvatarColor} />}
              {currentStep === "houseChoice" && <HouseChoiceStep choice={houseChoice} setChoice={setHouseChoice} />}
              {currentStep === "createHouse" && <CreateHouseStep houseName={houseName} setHouseName={setHouseName} />}
              {currentStep === "joinHouse" && <JoinHouseStep inviteCode={inviteCode} setInviteCode={setInviteCode} />}
              {currentStep === "success" && <SuccessStep houseChoice={houseChoice!} houseName={houseChoice === "create" ? houseName : "Your House"} username={username} avatarColor={avatarColor} generatedCode={generatedCode} codeCopied={codeCopied} onCopyCode={copyCode} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6">
          {currentStep === "success" ? (
            <button onClick={finish} className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
              Let's go! <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={next} disabled={!canAdvance() || loading} className={cn("w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200", canAdvance() && !loading ? "bg-primary text-primary-foreground shadow-md hover:scale-[1.02] active:scale-[0.98]" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              {loading ? "..." : "Continue"} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function ProfileStep({ username, setUsername, avatarColor, setAvatarColor }: { username: string; setUsername: (v: string) => void; avatarColor: number; setAvatarColor: (v: number) => void }) {
  const initials = username.trim().slice(0, 2).toUpperCase() || "?";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Create your profile</h2>
        <p className="text-sm text-muted-foreground">Pick a username your roommates will see</p>
      </div>
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-foreground/80 transition-colors duration-300 shadow-sm" style={{ backgroundColor: AVATAR_COLORS[avatarColor].hsl }}>{initials}</div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Pick a color</label>
        <div className="flex gap-3 justify-center">
          {AVATAR_COLORS.map((color, i) => (
            <button key={color.name} onClick={() => setAvatarColor(i)} className={cn("w-10 h-10 rounded-xl transition-all duration-200", avatarColor === i && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110")} style={{ backgroundColor: color.hsl }} />
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. alex_m" maxLength={20} className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        <p className="text-xs text-muted-foreground mt-1.5">2–20 characters, visible to your roommates</p>
      </div>
    </div>
  );
}

function HouseChoiceStep({ choice, setChoice }: { choice: HouseChoice; setChoice: (v: HouseChoice) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Your house</h2>
        <p className="text-sm text-muted-foreground">Create a new house or join one</p>
      </div>
      <div className="space-y-3">
        <button onClick={() => setChoice("create")} className={cn("w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200", choice === "create" ? "bg-primary/10 border-primary/30 shadow-sm" : "bg-card border-border hover:bg-accent/40")}>
          <div className="w-12 h-12 rounded-xl bg-celery/30 flex items-center justify-center flex-shrink-0"><Home className="w-6 h-6 text-primary" /></div>
          <div><h3 className="font-bold text-base">Create a house</h3><p className="text-xs text-muted-foreground mt-0.5">Set up a new space and invite roommates</p></div>
          {choice === "create" && <Check className="w-5 h-5 text-primary ml-auto" />}
        </button>
        <button onClick={() => setChoice("join")} className={cn("w-full flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200", choice === "join" ? "bg-primary/10 border-primary/30 shadow-sm" : "bg-card border-border hover:bg-accent/40")}>
          <div className="w-12 h-12 rounded-xl bg-oat/60 flex items-center justify-center flex-shrink-0"><Users className="w-6 h-6 text-warm-brown" /></div>
          <div><h3 className="font-bold text-base">Join a house</h3><p className="text-xs text-muted-foreground mt-0.5">Got an invite code? Jump right in</p></div>
          {choice === "join" && <Check className="w-5 h-5 text-primary ml-auto" />}
        </button>
      </div>
    </div>
  );
}

function CreateHouseStep({ houseName, setHouseName }: { houseName: string; setHouseName: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Name your house</h2>
        <p className="text-sm text-muted-foreground">Something fun your roommates will recognize</p>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">House name</label>
        <input type="text" value={houseName} onChange={(e) => setHouseName(e.target.value)} placeholder="e.g. Maple House" maxLength={30} className="w-full px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
        <div className="flex gap-2 mt-3 flex-wrap">
          {["Maple House", "Cozy Corner", "The Nest"].map((hint) => (
            <button key={hint} onClick={() => setHouseName(hint)} className="text-xs px-3 py-1.5 rounded-full bg-accent/60 text-accent-foreground font-semibold hover:bg-accent transition-colors">{hint}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function JoinHouseStep({ inviteCode, setInviteCode }: { inviteCode: string; setInviteCode: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Join a house</h2>
        <p className="text-sm text-muted-foreground">Enter the invite code your roommate shared</p>
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Invite code</label>
        <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="e.g. ABCD-1234" maxLength={15} className="w-full px-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground/60 text-xl font-extrabold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase" />
      </div>
    </div>
  );
}

function SuccessStep({ houseChoice, houseName, username, avatarColor, generatedCode, codeCopied, onCopyCode }: { houseChoice: "create" | "join"; houseName: string; username: string; avatarColor: number; generatedCode: string; codeCopied: boolean; onCopyCode: () => void }) {
  const initials = username.trim().slice(0, 2).toUpperCase();
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-extrabold text-foreground/80 shadow-sm mb-4" style={{ backgroundColor: AVATAR_COLORS[avatarColor].hsl }}>{initials}</div>
      <h2 className="text-2xl font-extrabold tracking-tight mb-2">{houseChoice === "create" ? "House created!" : "You're in!"}</h2>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs mb-2">
        {houseChoice === "create" ? `Welcome to ${houseName}! Share the invite code so your roommates can join.` : `You've joined ${houseName}!`}
      </p>
      {houseChoice === "create" && generatedCode && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 w-full max-w-xs">
          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Invite code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-muted/50 text-lg font-extrabold tracking-widest text-center select-all">{generatedCode}</div>
            <button onClick={onCopyCode} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", codeCopied ? "bg-done/20 text-done" : "bg-primary/10 text-primary hover:bg-primary/20")}>
              {codeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Onboarding;
