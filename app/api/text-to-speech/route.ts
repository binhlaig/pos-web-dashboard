import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { withRefreshCookieBridge } from "@/lib/session-cookie-bridge";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const fail = (message: string, status: number) => NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
async function generate(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin || req.headers.get("sec-fetch-site") === "cross-site") return fail("Cross-origin request rejected.", 403);
  const session = await getServerSession(authOptions);
  if (!session?.user) return fail("Login ပြန်ဝင်ပါ။", 401);
  const user = session.user as { business_type?: string; businessType?: string };
  if ((user.business_type ?? user.businessType) !== "FACTORY") return fail("Factory access လိုအပ်ပါသည်။", 403);
  let text: string;
  try {
    if (Number(req.headers.get("content-length") || 0) > 24000) return fail("စာရှည်လွန်းပါသည်။ စာပိုဒ်ခွဲပြီး ထည့်ပါ။", 413);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 24000) return fail("စာရှည်လွန်းပါသည်။ စာပိုဒ်ခွဲပြီး ထည့်ပါ။", 413);
    const input = JSON.parse(raw);
    if (!input || Array.isArray(input) || Object.keys(input).length !== 1 || typeof input.text !== "string") return fail("စာသားကိုသာ ပို့ပါ။", 400);
    text = input.text.trim();
    if (!text || text.length > 2000) return fail("စာလုံး ၁ မှ ၂၀၀၀ အတွင်း ဖြည့်ပါ။", 400);
  } catch { return fail("စာသား မမှန်ပါ။", 400); }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fail("Server တွင် GEMINI_API_KEY သတ်မှတ်ပြီး restart လုပ်ပါ။", 503);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent", {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(50000),
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { voice: "Kore" } } } }),
    });
    if (!response.ok) return fail(response.status === 429 ? "Google အသုံးပြုမှုကန့်သတ်ချက် ပြည့်နေပါသည်။ နောက်မှ ပြန်စမ်းပါ။" : "Google အသံရယူမရပါ။ API key နှင့် model access ကို စစ်ပါ။", response.status === 429 ? 429 : 502);
    const data = await response.json();
    const audioData = data?.candidates?.[0]?.content?.parts?.find((part: { inlineData?: { data?: string } }) => part.inlineData?.data)?.inlineData?.data;
    if (typeof audioData !== "string" || audioData.length > 16000000) throw new Error("Invalid audio");
    const audio = Buffer.from(audioData, "base64");
    if (audio.length < 44 || audio.toString("ascii",0,4) !== "RIFF" || audio.toString("ascii",8,12) !== "WAVE") throw new Error("Invalid WAV");
    return new Response(audio, { headers: { "Content-Type": "audio/wav", "Cache-Control": "private, no-store", "Content-Disposition": 'attachment; filename="myanmar-speech.wav"' } });
  } catch { return fail("အသံထုတ်ချိန် ကြာနေခြင်း သို့မဟုတ် ချိတ်ဆက်မှု ပြတ်တောက်ခြင်း ဖြစ်နိုင်ပါသည်။ စာပိုဒ်တိုဖြင့် ပြန်စမ်းပါ။", 502); }
}
export const POST = withRefreshCookieBridge(generate);
