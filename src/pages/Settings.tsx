import { useState } from "react";
import { User, Mail, Bell, Moon, Home, Share2, LogOut, HelpCircle, Info, Trash2, ChevronRight, Palette } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [reminders, setReminders] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">Settings</h1>

        {/* Account */}
        <Section title="Account">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold text-foreground/80 flex-shrink-0" style={{ backgroundColor: "hsl(110, 20%, 70%)" }}>
                AL
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">@alex_m</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" /> Connected with Google
                </p>
              </div>
            </div>
            <NavRow icon={<User className="w-4 h-4" />} label="Edit profile" />
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ToggleRow icon={<Bell className="w-4 h-4" />} label="Reminders" value={reminders} onChange={setReminders} last />
          </div>
        </Section>

        {/* House */}
        <Section title="House">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <NavRow icon={<Home className="w-4 h-4" />} label="Maple House" subtitle="Rename house" />
            <NavRow icon={<Share2 className="w-4 h-4" />} label="Invite settings" />
            <NavRow icon={<LogOut className="w-4 h-4" />} label="Leave house" last />
          </div>
        </Section>

        {/* App */}
        <Section title="App">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <NavRow icon={<Palette className="w-4 h-4" />} label="Appearance" subtitle="System default" />
            <NavRow icon={<HelpCircle className="w-4 h-4" />} label="Help & support" />
            <NavRow icon={<Info className="w-4 h-4" />} label="About Chore Harmony" subtitle="v1.0.0" last />
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <NavRow icon={<LogOut className="w-4 h-4" />} label="Log out" destructive />
            <NavRow icon={<Trash2 className="w-4 h-4" />} label="Delete account" destructive last />
          </div>
        </Section>
      </div>
      <BottomNav />
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      {title && (
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function NavRow({ icon, label, subtitle, destructive, last }: { icon: React.ReactNode; label: string; subtitle?: string; destructive?: boolean; last?: boolean }) {
  return (
    <button className={cn("w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/30 transition-colors text-left", !last && "border-b border-border", destructive && "text-destructive")}>
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

function ToggleRow({ icon, label, value, onChange, border, last }: { icon: React.ReactNode; label: string; value: boolean; onChange: (v: boolean) => void; border?: boolean; last?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3.5", !last && "border-b border-border")}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={cn("w-12 h-7 rounded-full flex items-center px-0.5 transition-colors duration-300", value ? "bg-primary" : "bg-muted")}
      >
        <div className={cn("w-6 h-6 bg-card rounded-full shadow-sm transition-transform duration-300", value ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

export default Settings;
