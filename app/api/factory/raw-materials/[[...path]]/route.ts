import { createFactoryRawProxy } from "@/lib/factory-raw-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const proxy = createFactoryRawProxy("raw-materials");
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
