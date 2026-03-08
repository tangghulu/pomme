import { useState } from "react";
import { User, Mail, Bell, Home, Share2, LogOut, HelpCircle, Info, Trash2, ChevronRight, Palette, Copy, Check, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useHouse, useInviteCode } from "@/hooks/useHouse";
import { updateProfile, updateHouseName, leaveHouse, deleteAccount } from "@/lib/houseActions";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type ModalType = "editProfile" | "renameHouse" | "invite" | "leaveHouse" | "deleteAccount" | null;

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: house } = useHouse();
  const { data: inviteCode } = useInviteCode();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reminders, setReminders] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        <StaggerContainer className="space-y-0">
          <StaggerItem>
            <h1 className="text-2xl font-extrabold tracking-tight mb-6">Settings</h1>
          </StaggerItem>

          <StaggerItem>
            <Section title="Account">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-foreground/80 flex-shrink-0" style={{ backgroundColor: profile?.avatar_color || "hsl(110, 20%, 70%)" }}>
                    {(profile?.username || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">@{profile?.username || "user"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {user?.email}</p>
                  </div>
                </div>
                <NavRow icon={<User className="w-4 h-4" />} label="Edit profile" onClick={() => setModal("editProfile")} />
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section title="Notifications">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <ToggleRow icon={<Bell className="w-4 h-4" />} label="Reminders" value={reminders} onChange={setReminders} last />
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section title="House">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <NavRow icon={<Home className="w-4 h-4" />} label={house?.name || "My House"} subtitle="Rename house" onClick={() => setModal("renameHouse")} />
                <NavRow icon={<Share2 className="w-4 h-4" />} label="Invite code" subtitle={inviteCode?.code || "—"} onClick={() => setModal("invite")} />
                <NavRow icon={<LogOut className="w-4 h-4" />} label="Leave house" onClick={() => setModal("leaveHouse")} last />
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section title="App">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <NavRow icon={<HelpCircle className="w-4 h-4" />} label="Help & support" />
                <NavRow icon={<Info className="w-4 h-4" />} label="About Pomme" subtitle="v1.0.0" last />
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section title="">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <NavRow icon={<LogOut className="w-4 h-4" />} label="Log out" destructive onClick={handleLogout} />
                <NavRow icon={<Trash2 className="w-4 h-4" />} label="Delete account" destructive last onClick={() => setModal("deleteAccount")} />
              </div>
            </Section>
          </StaggerItem>
        </StaggerContainer>
      </div>

      <AnimatePresence>
        {modal === "editProfile" && (
          <EditProfileModal
            username={profile?.username || ""}
            avatarColor={profile?.avatar_color || "hsl(110, 20%, 70%)"}
            userId={user?.id || ""}
            onClose={() => setModal(null)}
            onSaved={() => { queryClient.invalidateQueries({ queryKey: ["profile"] }); setModal(null); }}
          />
        )}
        {modal === "renameHouse" && (
          <RenameHouseModal
            currentName={house?.name || ""}
            houseId={house?.id || ""}
            onClose={() => setModal(null)}
            onSaved={() => { queryClient.invalidateQueries({ queryKey: ["house"] }); setModal(null); }}
          />
        )}
        {modal === "invite" && (
          <InviteModal code={inviteCode?.code || ""} onClose={() => setModal(null)} />
        )}
        {modal === "leaveHouse" && (
          <ConfirmModal
            title="Leave house?"
            description="You'll lose access to all chores and assignments. This can't be undone."
            confirmLabel="Leave"
            onConfirm={async () => {
              if (house && user) {
                await leaveHouse(house.id, user.id);
                queryClient.invalidateQueries();
                navigate("/onboarding");
              }
            }}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "deleteAccount" && (
          <ConfirmModal
            title="Delete account?"
            description="This will remove your profile and sign you out. This can't be undone."
            confirmLabel="Delete"
            onConfirm={async () => {
              if (user) {
                await deleteAccount(user.id);
                navigate("/auth");
              }
            }}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </PageTransition>
  );
};

// --- Modals ---

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }} className="relative w-full max-w-md bg-card rounded-t-3xl p-5 pb-10">
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
        {children}
      </motion.div>
    </div>
  );
}

const AVATAR_COLORS = [
  "hsl(110, 20%, 70%)", "hsl(90, 35%, 75%)", "hsl(35, 30%, 85%)",
  "hsl(200, 30%, 75%)", "hsl(10, 60%, 70%)", "hsl(45, 80%, 65%)",
];

function EditProfileModal({ username: initial, avatarColor: initialColor, userId, onClose, onSaved }: { username: string; avatarColor: string; userId: string; onClose: () => void; onSaved: () => void }) {
  const [username, setUsername] = useState(initial);
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await updateProfile(userId, { username, avatar_color: color });
      toast({ title: "Profile updated" });
      onSaved();
    } catch {
      toast({ title: "Error", description: "Could not update profile", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-extrabold mb-4">Edit profile</h2>
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-extrabold text-foreground/80" style={{ backgroundColor: color }}>
          {username.slice(0, 2).toUpperCase() || "?"}
        </div>
      </div>
      <div className="flex gap-3 justify-center mb-4">
        {AVATAR_COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} className={cn("w-9 h-9 rounded-xl transition-all", color === c && "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110")} style={{ backgroundColor: c }} />
        ))}
      </div>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={20} className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border text-foreground text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" />
      <button onClick={save} disabled={loading || username.trim().length < 2} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? "Saving..." : "Save"}
      </button>
    </ModalShell>
  );
}

function RenameHouseModal({ currentName, houseId, onClose, onSaved }: { currentName: string; houseId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await updateHouseName(houseId, name);
      toast({ title: "House renamed" });
      onSaved();
    } catch {
      toast({ title: "Error", description: "Could not rename house", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-extrabold mb-4">Rename house</h2>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border text-foreground text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4" />
      <button onClick={save} disabled={loading || name.trim().length < 2} className="w-full py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? "Saving..." : "Save"}
      </button>
    </ModalShell>
  );
}

function InviteModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-extrabold mb-2">Invite code</h2>
      <p className="text-sm text-muted-foreground mb-4">Share this code with your roommates so they can join your house.</p>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 px-4 py-3 rounded-xl bg-muted/50 text-xl font-extrabold tracking-widest text-center select-all">{code || "No code"}</div>
        <button onClick={copy} className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", copied ? "bg-done/20 text-done" : "bg-primary/10 text-primary hover:bg-primary/20")}>
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </ModalShell>
  );
}

function ConfirmModal({ title, description, confirmLabel, onConfirm, onClose }: { title: string; description: string; confirmLabel: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try { await onConfirm(); } catch { setLoading(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-xl font-extrabold mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold text-sm border border-border text-muted-foreground hover:bg-accent/40 transition-colors">Cancel</button>
        <button onClick={handle} disabled={loading} className="flex-1 py-3 rounded-2xl font-bold text-sm bg-destructive text-destructive-foreground shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
          {loading ? "..." : confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

// --- Shared components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      {title && <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</p>}
      {children}
    </div>
  );
}

function NavRow({ icon, label, subtitle, destructive, last, onClick }: { icon: React.ReactNode; label: string; subtitle?: string; destructive?: boolean; last?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/30 transition-colors text-left", !last && "border-b border-border", destructive && "text-destructive")}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <span className="text-sm font-semibold">{label}</span>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

function ToggleRow({ icon, label, value, onChange, last }: { icon: React.ReactNode; label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3.5", !last && "border-b border-border")}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <button onClick={() => onChange(!value)} className={cn("w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300", value ? "bg-primary" : "bg-muted")}>
        <div className={cn("w-6 h-6 bg-card rounded-full shadow-sm transition-transform duration-300", value ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

export default Settings;
