import { NextRequest } from "next/server";
import { proxyReceiptsRequest } from "@/lib/pos-receipts-proxy";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  return proxyReceiptsRequest(req, "/my");
}
