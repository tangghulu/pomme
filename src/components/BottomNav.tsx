import { Home, ListChecks, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Home", active: true },
  { icon: ListChecks, label: "Chores", active: false },
  { icon: Users, label: "Roomies", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={cn(
              "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors",
              tab.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className={cn("w-5 h-5", tab.active && "stroke-[2.5px]")} />
            <span className={cn("text-[10px] font-semibold", tab.active && "font-bold")}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
