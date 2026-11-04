"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function MyanmarTextToSpeechPage() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioText, setAudioText] = useState("");
  const controller = useRef<AbortController | null>(null);
  const urlRef = useRef("");
  useEffect(() => () => { controller.current?.abort(); if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  async function generate() {
    const submitted = text.trim();
    if (!submitted || controller.current || submitted.length > 2000) return;
    if (audioUrl && submitted === audioText) return;
    const request = new AbortController(); controller.current = request;
    const timer = setTimeout(() => request.abort(), 55000);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/text-to-speech", { method: "POST", credentials: "same-origin", signal: request.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: submitted }) });
      if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.message || "အသံထုတ်မရပါ။"); }
      const blob = await response.blob();
      if (request.signal.aborted || !blob.size || !blob.type.startsWith("audio/")) throw new Error("အသံဖိုင် မမှန်ပါ။");
      const next = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = next; setAudioUrl(next); setAudioText(submitted);
    } catch (e) {
      if (controller.current === request) setError(request.signal.aborted ? "အသံထုတ်မှု ရပ်သွားပါပြီ။ လိုအပ်လျှင် ပြန်ထုတ်နိုင်ပါတယ်။" : e instanceof Error ? e.message : "အသံထုတ်မရပါ။");
    } finally { clearTimeout(timer); if (controller.current === request) { controller.current = null; setBusy(false); } }
  }
  return <div lang="my" className="mx-auto max-w-3xl space-y-6 px-4 py-6">
    <Link href="/factory" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-4" /> Factory သို့ ပြန်ရန်</Link>
    <header><div className="mb-3 inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-500/10"><Volume2 className="size-6" /></div><h1 className="text-xl font-semibold">မြန်မာစာမှ အသံထုတ်ရန်</h1><p className="mt-2 text-sm leading-8 text-muted-foreground">စာရေးထည့်ပြီး အသံထုတ်မည်ကို နှိပ်ပါ။ ထွက်လာတဲ့အသံကို နားထောင်ပြီး WAV ဖိုင်အဖြစ် သိမ်းနိုင်ပါတယ်။</p></header>
    <form onSubmit={e => { e.preventDefault(); void generate(); }} className="space-y-3">
      <label htmlFor="speech-text" className="block text-sm font-medium">အသံဖတ်ပြမည့် စာသား</label>
      <textarea id="speech-text" value={text} onChange={e => setText(e.target.value)} maxLength={2000} disabled={busy} rows={8} placeholder="မင်္ဂလာပါ။ ဒီနေ့ ပစ္စည်းရောင်းအားကို စစ်ဆေးကြရအောင်။" className="w-full resize-y rounded-2xl border bg-background p-4 text-sm leading-8 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60" />
      <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>အသံထုတ်မည် နှိပ်သည့် စာသားကို Google ဆီ ပို့ပါမည်။</span><span>{text.length} / 2000</span></div>
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || !text.trim() || (audioText === text.trim() && !!audioUrl)} className="min-h-11 rounded-xl bg-blue-600 text-white">{busy ? <Loader2 className="size-4 animate-spin" /> : <Volume2 className="size-4" />}{busy ? "အသံထုတ်နေပါသည်…" : "အသံထုတ်မည်"}</Button>{busy && <Button type="button" variant="outline" onClick={() => controller.current?.abort()}><Square className="size-4" /> ရပ်မည်</Button>}</div>
    </form>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs leading-7 text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
    {audioUrl && <section aria-label="ထုတ်ထားသောအသံ" className="space-y-3 rounded-2xl border p-4"><h2 className="text-sm font-semibold">{audioText === text.trim() ? "အသံ အဆင်သင့်ဖြစ်ပါပြီ" : "ယခင်ထုတ်ထားသော စာသားအတွက် အသံ"}</h2><audio key={audioUrl} controls src={audioUrl} className="w-full" /><a href={audioUrl} download="myanmar-speech.wav" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm"><Download className="size-4" /> WAV Download</a><details className="text-xs"><summary className="cursor-pointer text-muted-foreground">ဤအသံအတွက် စာသားကြည့်ရန်</summary><p className="mt-2 whitespace-pre-wrap break-words leading-7">{audioText}</p></details></section>}
    <p className="text-xs leading-7 text-muted-foreground">အသံအသစ်ထုတ်ခြင်းက API quota သုံးပါတယ်။ ထုတ်ပြီးသားအသံကို ပြန်နားထောင်ခြင်းနဲ့ Download က API ထပ်မခေါ်ပါ။ စာရှည်ရင် စာပိုဒ်တိုခွဲပြီး တစ်ခါစီ ထုတ်ပါ။</p>
  </div>;
}