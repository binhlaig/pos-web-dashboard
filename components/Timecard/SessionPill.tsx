import {
  breakMs,
  onBreak,
  prettyClock,
  prettyHM,
  Shift,
  workMs,
} from "@/app/employment/employee_time_card/page";
import { Badge } from "../ui/badge";

function SessionPill({ active, now }: { active?: Shift; now: number }) {
  const net = active ? workMs(active, now) : 0;
  const br = active ? breakMs(active, now) : 0;
  const total = net + br;
  const netPct = total === 0 ? 0 : (net / total) * 100;
  const brPct = total === 0 ? 0 : (br / total) * 100;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {active ? (onBreak(active) ? "Break" : "Working") : "—"}
          </Badge>
          {active && (
            <span className="text-xs text-slate-500 dark:text-white/50">
              Started {prettyClock(active.clockIn)}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50">
            Net
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {prettyHM(net)}
          </p>
        </div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full bg-sky-500/80" style={{ width: `${netPct}%` }} />
        <div
          className="-mt-3 h-3 bg-amber-500/70"
          style={{ width: `${brPct}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 text-center text-xs text-slate-600 dark:text-white/70">
        <div>Elapsed: {prettyHM(total)}</div>
        <div>Break: {prettyHM(br)}</div>
        <div>Net: {prettyHM(net)}</div>
      </div>
    </div>
  );
}

export default SessionPill;
