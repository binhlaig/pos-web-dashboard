const SHIFT_BLOCKS = [
  { label: "Day Shift", time: "07:00–15:00", sub: "8 staff on duty", bg: "bg-[#f5eed8]", border: "border-[#e8d5a0]", accent: "border-l-[#b8922a]", labelColor: "text-[#b8922a]", timeColor: "text-[#1a1a18]" },
  { label: "Evening", time: "15:00–23:00", sub: "6 staff on duty", bg: "bg-blue-50", border: "border-blue-200", accent: "border-l-blue-700", labelColor: "text-blue-700", timeColor: "text-[#1a1a18]" },
  { label: "Rush Hour", time: "18:00–20:00", sub: "Extra cover needed", bg: "bg-amber-50", border: "border-amber-200", accent: "border-l-amber-600", labelColor: "text-amber-700", timeColor: "text-amber-700" },
  { label: "Manager Check", time: "17:30", sub: "Prepare reports", bg: "bg-green-50", border: "border-green-200", accent: "border-l-green-700", labelColor: "text-green-700", timeColor: "text-[#1a1a18]" },
];

const AI_ACTIONS: { label: string; prompt: string; warn?: boolean }[] = [
  { label: "Sales summary", prompt: "Give me a full sales summary for today" },
  { label: "Restock order", prompt: "Create purchase orders for all low-stock items", warn: true },
  { label: "Rush hour prep", prompt: "What should we prepare for rush hour tonight?" },
  { label: "Closing steps", prompt: "Walk me through the store closing procedure" },
  { label: "Expiry check", prompt: "Check for items expiring within 3 days and suggest promotions", warn: true },
  { label: "Staff report", prompt: "Generate a staff performance report for today" },
];

export function ShiftSchedule() {
  return (
    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-black/8">
        <span className="text-[11px] font-bold text-[#1a1a18]">Shift Schedule</span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {SHIFT_BLOCKS.map((b) => (
          <div
            key={b.label}
            className={`rounded-lg p-2.5 border border-l-[3px] ${b.bg} ${b.border} ${b.accent}`}
          >
            <div className={`text-[8px] font-bold uppercase tracking-wide mb-1 ${b.labelColor}`}>
              {b.label}
            </div>
            <div className={`text-[12px] font-bold ${b.timeColor}`}>{b.time}</div>
            <div className="text-[9px] text-[#5c5b56] mt-0.5">{b.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiAssistant() {
  return (
    <div className="bg-[#1a1a18] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold text-white">AI Assistant</span>
        <span className="text-[8px] bg-green-50 text-green-700 rounded-full px-2 py-0.5 font-bold">
          LIVE
        </span>
      </div>
      <p className="text-[10px] text-white/38 mb-3">Quick actions — click to ask Claude</p>
      <div className="flex flex-wrap gap-1.5">
        {AI_ACTIONS.map((a) => (
          <a
            key={a.label}
            href={`https://claude.ai/new?q=${encodeURIComponent(a.prompt)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] font-medium rounded-full border px-2.5 py-1 transition-colors cursor-pointer ${
              a.warn
                ? "bg-red-900/25 text-red-300 border-red-700/40 hover:bg-red-900/40"
                : "bg-white/8 text-white/78 border-white/10 hover:bg-white/14"
            }`}
          >
            {a.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
