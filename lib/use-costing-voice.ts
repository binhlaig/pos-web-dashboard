"use client";
import { useEffect, useRef, useState } from "react";
import { costingVoiceQuestion } from "@/lib/costing-voice-questions";
import toast from "react-hot-toast";
export function useCostingVoice(questionKey: string | number) {
  const [speakingQuestion, setSpeakingQuestion] = useState("");
  const native = useRef<SpeechSynthesisUtterance | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  const pending = useRef<AbortController | null>(null);
  const cache = useRef(new Map<string, string>());
  const active = useRef("");
  const stop = () => {
    active.current = ""; pending.current?.abort(); pending.current = null;
    if (native.current && "speechSynthesis" in window) { native.current = null; window.speechSynthesis.cancel(); }
    player.current?.pause(); player.current = null; setSpeakingQuestion("");
  };
  useEffect(() => { stop(); /* Stop playback when the selected question changes. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey]);
  useEffect(() => () => {
    active.current = ""; pending.current?.abort(); player.current?.pause();
    if (native.current && "speechSynthesis" in window) window.speechSynthesis.cancel();
    cache.current.forEach(url => URL.revokeObjectURL(url)); cache.current.clear();
  }, []);
  const play = (url: string, text: string) => {
    const audio = new Audio(url); player.current = audio;
    audio.onended = () => { if (player.current === audio) stop(); };
    audio.onerror = () => { if (player.current === audio) { stop(); toast.error("အသံဖိုင်ကို ဖွင့်မရပါ။ ပြန်စမ်းပါ။"); } };
    void audio.play().catch(() => {
      if (active.current !== text) return;
      stop(); toast.error("အသံဖွင့်ရန် voice ခလုတ်ကို ထပ်နှိပ်ပါ။");
    });
  };
  async function readQuestion(questionId: string) {
    const text = costingVoiceQuestion(questionId);
    if (!text) return;
    if (active.current === text) { stop(); return; }
    stop(); active.current = text; setSpeakingQuestion(text);
    const cached = cache.current.get(text);
    if (cached) { play(cached, text); return; }
    if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
      const voice = window.speechSynthesis.getVoices().find(item => /^my(?:-|$)/i.test(item.lang));
      if (voice) {
        const utterance = new SpeechSynthesisUtterance(text); native.current = utterance;
        utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = 0.9;
        utterance.onend = () => { if (native.current === utterance) stop(); };
        utterance.onerror = () => { if (native.current === utterance) { stop(); toast.error("စက်အသံဖတ်ပြမရပါ။ ထပ်စမ်းပါ။"); } };
        window.speechSynthesis.speak(utterance); return;
      }
    }
    // No installed Burmese voice: ask the authenticated server TTS service.
    const controller = new AbortController(); pending.current = controller;
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch("/api/factory/costing-voice", {
        method: "POST", credentials: "same-origin", signal: controller.signal,
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "အသံရယူမရပါ။");
      }
      const blob = await response.blob();
      if (active.current !== text || controller.signal.aborted) return;
      if (!blob.size || !blob.type.startsWith("audio/")) throw new Error("အသံဖိုင် မမှန်ပါ။");
      if (cache.current.size >= 8) { const first = cache.current.keys().next().value!; URL.revokeObjectURL(cache.current.get(first)!); cache.current.delete(first); }
      const url = URL.createObjectURL(blob); cache.current.set(text, url); pending.current = null;
      play(url, text);
    } catch (error) {
      if (active.current !== text) return;
      const timedOut = controller.signal.aborted;
      stop(); toast.error(timedOut ? "အသံရယူချိန် ကြာနေပါသည်။ ပြန်နှိပ်ပြီး စမ်းပါ။" : error instanceof Error ? error.message : "အသံဖတ်ပြမရပါ။");
    } finally { clearTimeout(timer); }
  }
  return { speakingQuestion, readQuestion };
}
