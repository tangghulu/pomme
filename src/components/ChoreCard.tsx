import { Check, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChoreStatus = "upcoming" | "done" | "overdue";

interface ChoreCardProps {
  name: string;
  assignee: string;
  dueDay: string;
  status: ChoreStatus;
  icon: string;
  onMarkDone?: () => void;
}

const statusConfig = {
  upcoming: {
    bg: "bg-upcoming/20",
    border: "border-upcoming/30",
    badge: "bg-upcoming/30 text-foreground",
    label: "Upcoming",
    Icon: Clock,
  },
  done: {
    bg: "bg-done/15",
    border: "border-done/30",
    badge: "bg-done/25 text-foreground",
    label: "Done ✓",
    Icon: Check,
  },
  overdue: {
    bg: "bg-overdue/15",
    border: "border-overdue/30",
    badge: "bg-overdue/25 text-foreground",
    label: "Overdue",
    Icon: AlertTriangle,
  },
};

const ChoreCard = ({ name, assignee, dueDay, status, icon, onMarkDone }: ChoreCardProps) => {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-200",
        config.bg,
        config.border,
        status === "done" && "opacity-75"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
          <div className="min-w-0">
            <h3 className={cn("font-bold text-base leading-tight", status === "done" && "line-through opacity-60")}>
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{assignee}</p>
            <p className="text-xs text-muted-foreground mt-1">{dueDay}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", config.badge)}>
            {config.label}
          </span>
          {status !== "done" && (
            <button
              onClick={onMarkDone}
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/25 flex items-center justify-center transition-colors"
              aria-label="Mark as done"
            >
              <Check className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChoreCard;
