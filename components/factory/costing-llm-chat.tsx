"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sparkles, Send, Square, Check, RotateCcw, SlidersHorizontal, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { costingChatPatch, costingChatReply, type CostingChatPatch } from "@/lib/costing-chat";
const fieldLabels: Record<string, string> = {
  product: "ပစ္စည်းအမည်", productType: "ပစ္စည်းအမျိုးအစား", containers: "ဝယ်ယူပမာဏ",
  unitsPerContainer: "တစ်ထုပ်ပါ အရေအတွက်", containerName: "ဝယ်ယူရောက်ရှိလာသော ပုံစံ",
  unitName: "ယူနစ်", purchasePriceMode: "ဝယ်ဈေးဖြည့်ပုံ", weightKg: "ဝယ်ယူအလေးချိန် / ပမာဏ",
  purchase: "ဝယ်ဈေး", processing: "ပြင်ဆင်စရိတ်", lossKg: "အလျော့ / ပျက်စီးပမာဏ",
  packGrams: "တစ်ရောင်းယူနစ်ပါပမာဏ", packaging: "ထုပ်ပိုးခ", sellingPrice: "ရောင်းဈေး",
  targetPercent: "လိုချင်သော အမြတ် %", minimumMargin: "အနည်းဆုံး Margin %", discount: "လျှော့ဈေး %",
  rounding: "ဈေးဝိုင်းယူနစ်", mode: "ဈေးတွက်နည်း", basis: "အမြတ်တွက်ချက်ပုံ",
};
type Message = { id: string; role: "user" | "assistant"; content: string; patch?: CostingChatPatch; applied?: boolean; snapshot?: string };
export function CostingLlmChat({ inputs, currencyCode, readOnly, onApply, editor }: {
  inputs: object; currencyCode: string; readOnly: boolean;
  onApply: (patch: CostingChatPatch) => boolean; editor: ReactNode;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  // Strip all photos and metadata before any request. Never send tokens or shop IDs.
  const context = Object.fromEntries(Object.entries(inputs).flatMap(([key, value]) => {
    const schema = costingChatPatch.shape[key as keyof typeof costingChatPatch.shape];
    if (!schema || value === "" || value === undefined) return [];
    const parsed = schema.safeParse(value);
    return parsed.success ? [[key, parsed.data]] : [];
  }));
  const snapshot = JSON.stringify(context);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, busy]);
  useEffect(() => () => abort.current?.abort(), []);
  async function send(prompt = text) {
    if (abort.current || !prompt.trim() || readOnly) return;
    const content = prompt.trim().slice(0, 4000);
    const previous = messages.slice(-14).map(({ role, content }) => ({ role, content: content.slice(0, 4000) }));
    setMessages(current => [...current, { id: crypto.randomUUID(), role: "user", content }]);
    setText(""); setBusy(true); setError("");
    const controller = new AbortController(); abort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch("/api/factory/costing-chat", {
        method: "POST", credentials: "same-origin", signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...previous, { role: "user", content }], context, currency: currencyCode }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Chat ပို့မရပါ။");
      const reply = costingChatReply.parse({ reply: body.reply, patch: body.patch });
      setModel(typeof body.model === "string" ? body.model : "");
      setMessages(current => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply.reply,
        patch: reply.patch, snapshot }]);
    } catch (e) {
      setError(controller.signal.aborted ? "တုံ့ပြန်မှု ရပ်ထားပါသည်။ စာကို ပြန်ပို့နိုင်ပါသည်။" : e instanceof Error ? e.message : "Chat ပို့မရပါ။");
      setText(content);
      // Remove the unsatisfied message so retry does not duplicate conversation history.
      setMessages(current => current.slice(0, -1));
    } finally { clearTimeout(timeout); abort.current = null; setBusy(false); }
  }
  return <div className="space-y-4">
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-4 sm:px-6">
        <span className="grid size-11 place-items-center rounded-2xl bg-blue-600 text-white"><Sparkles className="size-5" /></span>
        <div className="min-w-0 flex-1"><h2 className="text-base font-semibold">Binhlaig Costing AI</h2><p className="text-xs leading-6 text-muted-foreground">{model ? `Model · ${model}` : "LLM Assistant · မြန်မာလို မေးမြန်းနိုင်ပါသည်"}</p></div>
        <Button type="button" variant="ghost" disabled={busy || messages.length === 0} onClick={() => { setMessages([]); setError(""); }} aria-label="စကားဝိုင်းအသစ်"><RotateCcw className="size-4" /> Chat အသစ်</Button>
        <Button type="button" variant="outline" aria-expanded={showEditor} onClick={() => setShowEditor(value => !value)}><SlidersHorizontal className="size-4" /> အချက်အလက်နှင့် ရလဒ်</Button>
      </header>
      <div className="h-[min(55vh,530px)] min-h-72 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8">
        {messages.length === 0 && <div className="mx-auto flex max-w-2xl flex-col items-center py-6 text-center"><span className="mb-4 grid size-16 place-items-center rounded-3xl bg-blue-50 text-blue-600 dark:bg-blue-500/10"><MessageSquare className="size-8" /></span><h3 className="text-xl font-semibold">ဒီနေ့ ဘာပစ္စည်းအတွက် တွက်မလဲ။</h3><p className="mt-3 text-sm leading-8 text-muted-foreground">ပစ္စည်းအမည်၊ ဝယ်ယူပမာဏနဲ့ ဝယ်ဈေးကို စာကြောင်းတစ်ကြောင်းနဲ့ ပြောပေးပါ။ AI က လိုအပ်တာ ဆက်မေးပြီး Form အတွက် အချက်အလက် အဆိုပြုပေးပါမယ်။</p><div className="mt-6 grid w-full gap-3 sm:grid-cols-2">{["ကြက်သား ၁၀ ပိဿာ၊ တစ်ပိဿာ ၁၅၀၀၀ ကျပ်၊ တစ်ထုပ် ၂၅ ကျပ်သား ခွဲရောင်းချင်တယ်။", "ဝယ်ဈေးနဲ့ ခွဲရောင်းပမာဏကို တစ်ဆင့်ချင်း မေးပြီး ကူညီပေးပါ။"].map(prompt => <button key={prompt} type="button" disabled={busy || readOnly} onClick={() => void send(prompt)} className="rounded-2xl border p-4 text-left text-xs leading-7 transition hover:bg-muted disabled:opacity-50">{prompt}</button>)}</div><p className="mt-5 text-[11px] leading-6 text-muted-foreground">Model မချိတ်ရသေးလျှင် ချိတ်ဆက်ရန်လိုကြောင်း ပြပါမည်။</p></div>}
        <div className="mx-auto max-w-3xl space-y-6">{messages.map(message => <article key={message.id} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-blue-600 p-4 text-white" : "mr-auto max-w-[95%] rounded-2xl rounded-tl-sm border bg-muted/30 p-4"}><p className="mb-2 text-[10px] font-semibold opacity-70">{message.role === "user" ? "သင်" : "COSTING AI"}</p><p className="whitespace-pre-wrap break-words text-sm leading-8">{message.content}</p>{message.patch && Object.keys(message.patch).length > 0 && <div className="mt-4 rounded-xl border bg-card p-3 text-foreground"><p className="text-xs font-semibold">Form ထဲထည့်ရန် အဆိုပြုချက်</p><dl className="mt-2 grid gap-2 text-xs">{Object.entries(message.patch).map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{fieldLabels[key] || key}</dt><dd className="break-all font-medium">{value}</dd></div>)}</dl><Button type="button" variant="outline" className="mt-3 w-full" disabled={readOnly || busy || message.applied || snapshot !== message.snapshot} onClick={() => { if (!onApply(message.patch!)) return; setMessages(current => current.map(item => item.id === message.id ? { ...item, applied: true } : item)); setShowEditor(true); }}><Check className="size-4" /> {message.applied ? "အဆိုပြုချက် ပို့ပြီးပါပြီ" : "စစ်ပြီး အသုံးပြုမည်"}</Button>{!message.applied && snapshot !== message.snapshot && <p className="mt-2 text-xs leading-6 text-amber-600">Form ပြောင်းသွားပါပြီ။ လက်ရှိအချက်အလက်နဲ့ AI ကို ပြန်မေးပါ။</p>}</div>}</article>)}{busy && <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="size-4 animate-pulse" /> AI က အဖြေပြင်ဆင်နေပါသည်…</p>}<div ref={bottom} /></div>
      </div>
      <footer className="border-t bg-background px-4 py-4 sm:px-8">{error && <p role="alert" className="mx-auto mb-3 max-w-3xl text-xs leading-7 text-red-600 dark:text-red-400">{error}</p>}<form onSubmit={e => { e.preventDefault(); void send(); }} className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-muted/30 p-2"><textarea aria-label="Costing AI သို့ မေးရန်" value={text} onChange={e => setText(e.target.value)} maxLength={4000} rows={2} disabled={busy || readOnly} placeholder="ပစ္စည်းအမည်၊ ပမာဏ၊ ဝယ်ဈေး… မြန်မာလို ရေးပါ" className="min-h-16 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-7 outline-none disabled:opacity-50" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />{busy ? <Button type="button" variant="outline" onClick={() => abort.current?.abort()} aria-label="တုံ့ပြန်မှုရပ်ရန်" className="size-11 rounded-xl"><Square className="size-4" /></Button> : <Button type="submit" disabled={!text.trim() || readOnly} aria-label="စာပို့မည်" className="size-11 rounded-xl bg-blue-600 text-white"><Send className="size-4" /></Button>}</form><p className="mt-2 text-center text-[10px] leading-6 text-muted-foreground">AI အဆိုပြုချက်ကို စစ်ပြီးမှ အသုံးပြုပါ။ ဈေးနှင့် အမြတ်ကို Costing calculator က တွက်ပေးသည်။</p></footer>
    </section>
    {showEditor && editor}
  </div>;
}