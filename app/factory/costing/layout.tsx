import { CostingRouteWorkspace } from "@/components/factory/costing-workspace";
export default function CostingLayout({ children }: { children: React.ReactNode }) {
  return <CostingRouteWorkspace>{children}</CostingRouteWorkspace>;
}