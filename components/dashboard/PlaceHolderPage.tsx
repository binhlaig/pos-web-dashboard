import type { NavPage } from "@/types";

interface PlaceholderPageProps {
  page: NavPage;
}

const PAGE_INFO: Record<NavPage, { icon: string; title: string; desc: string; prompt: string }> = {
  dashboard: { icon: "📊", title: "Dashboard", desc: "", prompt: "" },
  tasks: { icon: "✅", title: "Tasks", desc: "Manage and update all shift tasks for your team.", prompt: "Help me build a full task management page for supermarket staff" },
  stock: { icon: "📦", title: "Inventory", desc: "Track stock levels and generate reorder reports automatically.", prompt: "Design an inventory management page with reorder workflow for a supermarket" },
  pos: { icon: "🏪", title: "POS / Sales", desc: "View all transactions and daily revenue breakdowns.", prompt: "Design a POS sales analytics page for our supermarket" },
  customers: { icon: "👥", title: "Customers", desc: "Customer count, flow analytics, and checkout performance.", prompt: "Design a customer analytics page for a supermarket dashboard" },
  staff: { icon: "🪪", title: "Staff & Shifts", desc: "Manage staff rosters, shift assignments, and attendance records.", prompt: "Design a staff scheduling and management page for a supermarket" },
  delivery: { icon: "🚚", title: "Deliveries", desc: "Track incoming deliveries, supplier orders, and receiving logs.", prompt: "Design a delivery management page for a supermarket" },
  promotions: { icon: "🏷", title: "Promotions", desc: "Create and manage in-store promotions and discount campaigns.", prompt: "Design a promotions management page for a supermarket" },
  expiry: { icon: "⏰", title: "Expiry Watch", desc: "Monitor products nearing their expiry date and take action.", prompt: "Design an expiry date monitoring page for supermarket staff" },
  reports: { icon: "📄", title: "Reports", desc: "Generate daily, weekly, and monthly performance reports.", prompt: "Design a reports and analytics page for supermarket management" },
  settings: { icon: "⚙️", title: "Settings", desc: "Configure store settings, preferences, and integrations.", prompt: "Design a settings page for a supermarket staff dashboard" },
};

export default function PlaceholderPage({ page }: PlaceholderPageProps) {
  const info = PAGE_INFO[page];
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] gap-4 text-center px-6">
      <div className="text-5xl">{info.icon}</div>
      <div>
        <h2 className="text-[18px] font-extrabold text-[#1a1a18] mb-1">{info.title}</h2>
        <p className="text-[12px] text-[#9c9b96] max-w-[280px] leading-relaxed">{info.desc}</p>
      </div>
      <a
        href={`https://claude.ai/new?q=${encodeURIComponent(info.prompt)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] font-semibold bg-[#1a1a18] text-white rounded-full px-5 py-2 hover:bg-[#2a2a28] transition-colors"
      >
        Open in Claude ↗
      </a>
    </div>
  );
}
