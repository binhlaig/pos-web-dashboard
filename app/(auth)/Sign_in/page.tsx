
"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const canSubmit = username.length > 0 && password.length > 0 && !submitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMsg("");

    try {
      // NextAuth credentials flow (no full-page redirect)
      const callbackUrl = searchParams.get("redirect") || "/dashboard";

      const res = await signIn("credentials", {
        redirect: false,
        username: username.trim(),
        password,
        // NextAuth will redirect here if redirect: true
        callbackUrl,
      });

      if (!res) {
        throw new Error("No response from auth server.");
      }

      if (res.error) {
        // "CredentialsSignin" => invalid credentials
        const text = res.error === "CredentialsSignin" ? "Invalid username or password" : res.error;
        setMsg(text);
        toast.error(text);
        return;
      }

      // success
      // optional: remember me -> persist a small local flag (NOT for tokens)
      try {
        const store = remember ? localStorage : sessionStorage;
        store.setItem("remember_login", remember ? "1" : "0");
      } catch {}

      toast.success(`Welcome ${username}!`);
      // Hard navigation so server components read the new session immediately
      window.location.replace(res.url || callbackUrl);
    } catch (err: any) {
      const text = err?.message || "Login failed";
      setMsg(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-br from-white to-slate-50 dark:from-[#0B0F1A] dark:to-[#0b0f1a] px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full max-w-md">
        <Card className="border-slate-200/80 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-cyan-600">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl tracking-tight text-slate-900 dark:text-cyan-100">Welcome back</CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  Please sign in to continue.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <form ref={formRef} onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Username */}
              <div className="grid gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g. aung_ko"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="/forgot" className="text-xs text-slate-600 underline-offset-2 hover:underline dark:text-slate-300">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                  Remember me
                </label>
                <Badge variant="secondary" className="text-[11px] dark:bg-white/10 dark:text-slate-300">Secure area</Badge>
              </div>

              <Separator />

              <Button type="submit" disabled={!canSubmit} className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-cyan-600 dark:hover:bg-cyan-500">
                {submitting ? "Signing in…" : "Sign in"}
              </Button>

              {msg && <p className="text-center text-sm text-slate-600 dark:text-slate-300">{msg}</p>}

              <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                No account?
                <a href="/register" className="ml-1 underline underline-offset-2">Create one</a>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
