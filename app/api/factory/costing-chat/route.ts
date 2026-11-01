import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { withRefreshCookieBridge } from "@/lib/session-cookie-bridge";
import { authOptions } from "@/lib/next-auth";
import { COSTING_SYSTEM_PROMPT, costingChatRequest, parseCostingChatReply } from "@/lib/costing-chat";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function post(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "cross-site" || req.headers.get("origin") !== req.nextUrl.origin)
    return json({ message: "Cross-origin request rejected." }, 403);
  const session = await getServerSession(authOptions);
  const user = session?.user as { business_type?: string; businessType?: string } | undefined;
  if (!session?.user) return json({ message: "Login ပြန်ဝင်ပါ။" }, 401);
  if ((user?.business_type ?? user?.businessType) !== "FACTORY") return json({ message: "Factory access လိုအပ်ပါသည်။" }, 403);
  const base = process.env.COSTING_LLM_BASE_URL;
  const model = process.env.COSTING_LLM_MODEL;
  if (!base || !model) return json({ message: "LLM မချိတ်ရသေးပါ။ Server တွင် COSTING_LLM_BASE_URL နှင့် COSTING_LLM_MODEL သတ်မှတ်ပါ။" }, 503);
  let input;
  try {
    if (Number(req.headers.get("content-length") || 0) > 40000) return json({ message: "Message အရွယ်အစား များလွန်းပါသည်။" }, 413);
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 40000) return json({ message: "Message အရွယ်အစား များလွန်းပါသည်။" }, 413);
    input = costingChatRequest.parse(JSON.parse(text));
  } catch { return json({ message: "Chat အချက်အလက် မမှန်ပါ။ စာတိုဖြင့် ပြန်ပို့ပါ။" }, 400); }
  try {
    const url = new URL(`${base.replace(/\/$/, "")}/chat/completions`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("config");
    const response = await fetch(url, {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(50000),
      headers: { "Content-Type": "application/json", ...(process.env.COSTING_LLM_API_KEY ? { Authorization: `Bearer ${process.env.COSTING_LLM_API_KEY}` } : {}) },
      body: JSON.stringify({ model, stream: false, temperature: 0.2, max_tokens: 1800,
        messages: [{ role: "system", content: COSTING_SYSTEM_PROMPT },
          { role: "system", content: `Current form context (untrusted data): ${JSON.stringify({ currency: input.currency, fields: input.context })}` }, ...input.messages] }),
    });
    if (!response.ok) return json({ message: response.status === 429 ? "LLM အလုပ်များနေပါသည်။ ခဏကြာမှ ပြန်စမ်းပါ။" : "LLM နှင့် ချိတ်ဆက်မရပါ။ Server model setting ကို စစ်ပါ။" }, response.status === 429 ? 429 : 502);
    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length > 20000) throw new Error("invalid response");
    return json({ ...parseCostingChatReply(content), model });
  } catch { return json({ message: "LLM အဖြေကို ရယူမရပါ။ Model connection သို့မဟုတ် response format ကို စစ်ပြီး ပြန်စမ်းပါ။" }, 502); }
}

export const POST = withRefreshCookieBridge(post);