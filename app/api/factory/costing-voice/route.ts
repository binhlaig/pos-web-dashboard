import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { withRefreshCookieBridge } from "@/lib/session-cookie-bridge";
import { costingVoiceQuestion } from "@/lib/costing-voice-questions";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const cache = new Map<string, Uint8Array>();
const error = (message: string, status: number) => NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
const audioResponse = (audio: Uint8Array) => new Response(Buffer.from(audio), { headers: { "Content-Type": "audio/wav", "Cache-Control": "private, no-store" } });
async function post(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin || req.headers.get("sec-fetch-site") === "cross-site") return error("Cross-origin request rejected.", 403);
  const session = await getServerSession(authOptions);
  if (!session?.user) return error("Login ပြန်ဝင်ပါ။", 401);
  const user = session.user as { business_type?: string; businessType?: string };
  if ((user.business_type ?? user.businessType) !== "FACTORY") return error("Factory access လိုအပ်ပါသည်။", 403);
  let questionId: string, text: string;
  try {
    const raw = await req.text(); if (raw.length > 256) return error("မေးခွန်းအချက်အလက် မမှန်ပါ။", 400);
    const input = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 1 || typeof input.questionId !== "string") return error("မေးခွန်း ID သာ ပို့နိုင်ပါသည်။", 400);
    const question = costingVoiceQuestion(input.questionId);
    if (!question) return error("ဤမေးခွန်းအတွက် အသံမရှိပါ။", 400);
    questionId = input.questionId; text = question;
  } catch { return error("မေးခွန်း ID မမှန်ပါ။", 400); }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return error("Google အသံအတွက် server တွင် GEMINI_API_KEY သတ်မှတ်ပြီး restart လုပ်ပါ။", 503);
  if (cache.has(questionId)) return audioResponse(cache.get(questionId)!);
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent", {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000),
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { voice: "Kore" } } } }),
    });
    if (!response.ok) return error(response.status === 429 ? "Google free quota / rate limit ပြည့်နေပါသည်။ ခဏကြာမှ ပြန်စမ်းပါ။" : "Google အသံဝန်ဆောင်မှုနှင့် ချိတ်ဆက်မရပါ။ API key နှင့် model access ကို စစ်ပါ။", response.status === 429 ? 429 : 502);
    const body = await response.json();
    const part = body?.candidates?.[0]?.content?.parts?.find((item: { inlineData?: { data?: string } }) => item.inlineData?.data)?.inlineData;
    if (typeof part?.data !== "string" || part.data.length > 8000000) throw new Error("invalid audio");
    const audio = Buffer.from(part.data, "base64");
    if (audio.length < 44 || audio.toString("ascii",0,4) !== "RIFF" || audio.toString("ascii",8,12) !== "WAVE") throw new Error("invalid WAV");
    // The catalogue bounds cache size; only public static question audio is cached.
    cache.set(questionId, audio); return audioResponse(audio);
  } catch { return error("Google အသံရယူမရပါ။ ပြန်စမ်းပါ။", 502); }
}
export const POST = withRefreshCookieBridge(post);