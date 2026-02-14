"use client";

import React, { useMemo, useRef, useState } from "react";
import { postForm } from "@/lib/api";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EyeOff, Eye, ImagePlus, UploadCloud, ShieldCheck, UserPlus2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CASHIER" | "ADMIN">("CASHIER");
  const [image, setImage] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  const pwScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^\w\s]/.test(password)) score += 15;
    return Math.min(100, score);
  }, [password]);

  const pwLabel = pwScore < 40 ? "Weak" : pwScore < 70 ? "Good" : "Strong";

  const onDrop = (files: FileList | null) => {
    if (files && files[0]) {
      const f = files[0];
      if (!f.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (f.size > 3 * 1024 * 1024) {
        toast.error("Image too large (max 3MB)");
        return;
      }
      setImage(f);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      toast.error("Username is required");
      return;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    setMsg("");

    try {
      const form = new FormData();
      form.append("username", trimmedUsername);
      form.append("password", password);
      form.append("role", role);
      if (image) form.append("image", image);

      // ✅ IMPORTANT: Use rewrite path + auth=false
      const data = await postForm<{
        access_token: string;
        username: string;
        role: string;
        avatarPath?: string | null;
      }>("/backend/api/auth/register", form, false);

      localStorage.setItem("token", data.access_token);

      const text = `Registered as ${data.username} (${data.role})`;
      setMsg(text);
      toast.success(text);
      router.push("/dashboard");

    } catch (err) {
      console.error("❌ Register error:", err);

      const text =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Registration failed";

      setMsg(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-br from-white to-slate-50 dark:from-[#0B0F1A] dark:to-[#0b0f1a] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <Card className="border-slate-200/80 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-cyan-600">
                <UserPlus2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl tracking-tight text-slate-900 dark:text-cyan-100">
                  Create your account
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                  Set a strong password and (optional) avatar.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="grid gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g. aung_ko"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={pwScore >= 70 ? "default" : "secondary"}>{pwLabel}</Badge>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={8}
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

                <Progress value={pwScore} className="h-1" />
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Use letters, numbers and symbols.
                </p>
              </div>

              <div className="grid gap-1.5">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as "CASHIER" | "ADMIN")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">CASHIER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Avatar (optional)</Label>
                <div
                  className="group relative flex min-h-28 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-4 text-center text-sm text-slate-500 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    onDrop(e.dataTransfer.files);
                  }}
                >
                  {!image ? (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="h-6 w-6" />
                      <span>Drag & drop image here, or</span>
                      <Button type="button" size="sm" onClick={() => fileRef.current?.click()}>
                        <ImagePlus className="mr-2 h-4 w-4" /> Choose file
                      </Button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => onDrop(e.target.files)}
                      />
                    </div>
                  ) : (
                    <div className="flex w-full items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="avatar preview"
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-white/10"
                        />
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {image.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {(image.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>
                      <Button type="button" variant="secondary" onClick={() => setImage(null)}>
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
              >
                {submitting ? "Creating..." : "Create account"}
              </Button>

            
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
