import { Suspense } from "react";
import { BusinessAccessGate } from "@/components/factory/BusinessAccessGate";
export default function EntryPage() {
  return <Suspense fallback={<div role="status">Checking business access…</div>}><BusinessAccessGate entry /></Suspense>;
}
