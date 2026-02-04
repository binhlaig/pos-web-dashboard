"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sun, Moon, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";

// shadcn/ui components — make sure you've installed shadcn and these components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


// ---------------------- Validation Schemas ----------------------
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirm: z.string().min(6, "Minimum 6 characters"),
  })
  .refine((vals) => vals.password === vals.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

// ---------------------- Theme Toggle ----------------------
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Avoid SSR/client mismatch: render a neutral button until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" className="rounded-2xl">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-2xl"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

// ---------------------- Aceternity-ish Background ----------------------
function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* moving beams */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.2 }}
        className="absolute -inset-[10%]"
      >
        <motion.div
          className="absolute left-1/4 top-[-10%] h-[60vmax] w-[60vmax] rounded-full bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-emerald-400/20 blur-3xl"
          animate={{ y: [0, 40, -20, 0], x: [0, -20, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-[-20%] h-[50vmax] w-[50vmax] rounded-full bg-gradient-to-tr from-fuchsia-500/20 via-violet-500/20 to-cyan-400/20 blur-3xl"
          animate={{ y: [0, -30, 30, 0], x: [0, 20, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* soft vignette spotlight */}
      <div className="absolute inset-0 [mask-image:radial-gradient(50%_50%_at_50%_30%,#000_30%,transparent_70%)] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
    </div>
  );
}

// ---------------------- Reusable Field ----------------------
function Field({ label, id, type, icon: Icon, register, error, placeholder }:{
  label: string;
  id: string;
  type: React.HTMLInputTypeAttribute;
  icon: React.ElementType;
  register: any;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
          <Icon className="h-4 w-4" />
        </div>
        <Input id={id} type={type} placeholder={placeholder}
               className="pl-9" {...register} />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------- Auth Page ----------------------
export default function AuthPage() {
  const [success, setSuccess] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<string>("login");

  // login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loginLoading },
    reset: resetLogin,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // register form
  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    formState: { errors: regErrors, isSubmitting: regLoading },
    reset: resetRegister,
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    setSuccess(null);
    // TODO: Replace with your real API call
    await new Promise((r) => setTimeout(r, 1000));
    setSuccess("Logged in successfully — replace with your auth logic.");
    resetLogin();
  };

  const onRegister = async (data: RegisterForm) => {
    setSuccess(null);
    // TODO: Replace with your real API call
    await new Promise((r) => setTimeout(r, 1200));
    setSuccess("Account created — replace with your API call.");
    resetRegister();
    setTab("login");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <AuroraBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center p-4 sm:p-6">
        <div className="mb-6 flex w-full items-center justify-between">
          <div className="text-sm opacity-70">Aceternity ✕ shadcn — Auth</div>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>Login or create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form className="grid gap-4" onSubmit={handleLoginSubmit(onLogin)}>
                    <Field
                      label="Email"
                      id="email"
                      type="email"
                      icon={Mail}
                      placeholder="you@example.com"
                      register={loginRegister("email")}
                      error={loginErrors.email?.message}
                    />
                    <Field
                      label="Password"
                      id="password"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      register={loginRegister("password")}
                      error={loginErrors.password?.message}
                    />

                    <Button type="submit" disabled={loginLoading} className="mt-2">
                      {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign in
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form className="grid gap-4" onSubmit={handleRegSubmit(onRegister)}>
                    <Field
                      label="Name"
                      id="name"
                      type="text"
                      icon={User}
                      placeholder="Your name"
                      register={regRegister("name")}
                      error={regErrors.name?.message}
                    />
                    <Field
                      label="Email"
                      id="reg-email"
                      type="email"
                      icon={Mail}
                      placeholder="you@example.com"
                      register={regRegister("email")}
                      error={regErrors.email?.message}
                    />
                    <Field
                      label="Password"
                      id="reg-password"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      register={regRegister("password")}
                      error={regErrors.password?.message}
                    />
                    <Field
                      label="Confirm Password"
                      id="confirm"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      register={regRegister("confirm")}
                      error={regErrors.confirm?.message}
                    />

                    <Button type="submit" disabled={regLoading} className="mt-2">
                      {regLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {success && (
                <div className="mt-6 flex items-start gap-2 rounded-lg border p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <p>{success}</p>
                </div>
              )}

              <Separator className="my-6" />
              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our <a className="underline underline-offset-4" href="#">Terms</a> and <a className="underline underline-offset-4" href="#">Privacy Policy</a>.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
