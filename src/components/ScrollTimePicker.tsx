import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5; // odd number for center alignment

interface WheelColumnProps {
  items: string[];
  selected: number;
  onChange: (index: number) => void;
}

function WheelColumn({ items, selected, onChange }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    scrollToIndex(selected, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    isScrolling.current = true;

    timeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
      const el = containerRef.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      scrollToIndex(clamped);
      if (clamped !== selected) onChange(clamped);
    }, 80);
  };

  const halfPad = Math.floor(VISIBLE_COUNT / 2);

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: ITEM_HEIGHT * VISIBLE_COUNT }}
    >
      {/* highlight band */}
      <div
        className="absolute left-0 right-0 bg-primary/10 rounded-xl pointer-events-none z-10"
        style={{
          top: ITEM_HEIGHT * halfPad,
          height: ITEM_HEIGHT,
        }}
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* top spacer */}
        <div style={{ height: ITEM_HEIGHT * halfPad }} />

        {items.map((item, i) => {
          const isSelected = i === selected;
          return (
            <div
              key={`${item}-${i}`}
              className={cn(
                "flex items-center justify-center snap-center transition-all duration-150 select-none cursor-pointer",
                isSelected
                  ? "text-foreground font-extrabold text-xl"
                  : "text-muted-foreground/50 font-semibold text-base"
              )}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => {
                onChange(i);
                scrollToIndex(i);
              }}
            >
              {item}
            </div>
          );
        })}

        {/* bottom spacer */}
        <div style={{ height: ITEM_HEIGHT * halfPad }} />
      </div>
    </div>
  );
}

interface ScrollTimePickerProps {
  value: string; // e.g. "9:00 AM"
  onChange: (value: string) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const periods = ["AM", "PM"];

function parseTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 9, minute: 0, period: "AM" };
  return {
    hour: parseInt(match[1]),
    minute: parseInt(match[2]),
    period: match[3].toUpperCase(),
  };
}

const ScrollTimePicker = ({ value, onChange }: ScrollTimePickerProps) => {
  const parsed = parseTime(value);
  const [hourIdx, setHourIdx] = useState(parsed.hour - 1);
  const [minIdx, setMinIdx] = useState(parsed.minute);
  const [periodIdx, setPeriodIdx] = useState(periods.indexOf(parsed.period));

  const emitChange = useCallback(
    (h: number, m: number, p: number) => {
      const timeStr = `${hours[h]}:${minutes[m]} ${periods[p]}`;
      onChange(timeStr);
    },
    [onChange]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center gap-0">
        <div className="flex-1">
          <WheelColumn
            items={hours}
            selected={hourIdx}
            onChange={(i) => { setHourIdx(i); emitChange(i, minIdx, periodIdx); }}
          />
        </div>
        <span className="text-xl font-bold text-muted-foreground mx-0.5">:</span>
        <div className="flex-1">
          <WheelColumn
            items={minutes}
            selected={minIdx}
            onChange={(i) => { setMinIdx(i); emitChange(hourIdx, i, periodIdx); }}
          />
        </div>
        <div className="flex-1">
          <WheelColumn
            items={periods}
            selected={periodIdx}
            onChange={(i) => { setPeriodIdx(i); emitChange(hourIdx, minIdx, i); }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScrollTimePicker;
