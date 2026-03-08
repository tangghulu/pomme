import { useState } from "react";
import { User, Mail, Bell, Home, Share2, LogOut, HelpCircle, Info, Trash2, ChevronRight, Palette } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useHouse } from "@/hooks/useHouse";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: house } = useHouse();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(true);

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
                <NavRow icon={<User className="w-4 h-4" />} label="Edit profile" />
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
                <NavRow icon={<Home className="w-4 h-4" />} label={house?.name || "My House"} subtitle="Rename house" />
                <NavRow icon={<Share2 className="w-4 h-4" />} label="Invite settings" />
                <NavRow icon={<LogOut className="w-4 h-4" />} label="Leave house" last />
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section title="App">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <NavRow icon={<Palette className="w-4 h-4" />} label="Appearance" subtitle="System default" />
                <NavRow icon={<HelpCircle className="w-4 h-4" />} label="Help & support" />
                <NavRow icon={<Info className="w-4 h-4" />} label="About Chore Harmony" subtitle="v1.0.0" last />
              </div>
            </Section>
          </StaggerItem>

          <StaggerItem>
            <Section title="">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <NavRow icon={<LogOut className="w-4 h-4" />} label="Log out" destructive onClick={handleLogout} />
                <NavRow icon={<Trash2 className="w-4 h-4" />} label="Delete account" destructive last />
              </div>
            </Section>
          </StaggerItem>
        </StaggerContainer>
      </div>
      <BottomNav />
    </PageTransition>
  );
};

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
