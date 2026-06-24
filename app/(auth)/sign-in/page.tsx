"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Hash,
  LogIn,
  User,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import { clearPosSession, savePosSession } from "@/lib/auth-session";
import { clearAuthTokens, saveToken } from "@/lib/auth";

/* ═══════════════════════════════════════════════════════════
   PREMIUM LANTERN SVG
═══════════════════════════════════════════════════════════ */
function PremiumLantern({
  size = 80,
  night = true,
}: {
  size?: number;
  night?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size * 1.72}
      viewBox="0 0 80 138"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="sl-fg1" cx="50%" cy="55%" r="48%">
          <stop offset="0%" stopColor="#fff9e0" stopOpacity="1" />
          <stop offset="22%" stopColor="#fcd34d" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="sl-bodyN" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a0703" />
          <stop offset="28%" stopColor="#150e05" />
          <stop offset="52%" stopColor="#1c1208" />
          <stop offset="100%" stopColor="#0c0803" />
        </linearGradient>

        <linearGradient id="sl-bodyD" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8d9b8" />
          <stop offset="30%" stopColor="#f5edd8" />
          <stop offset="55%" stopColor="#faf4e8" />
          <stop offset="100%" stopColor="#e0cfa8" />
        </linearGradient>

        <linearGradient id="sl-sheenL" x1="0" y1="0" x2="1" y2="1">
          <stop
            offset="0%"
            stopColor="white"
            stopOpacity={night ? "0.09" : "0.55"}
          />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="sl-sheenR" x1="1" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="white"
            stopOpacity={night ? "0.04" : "0.3"}
          />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="sl-metalG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a352" />
          <stop offset="40%" stopColor="#b8841e" />
          <stop offset="70%" stopColor="#9a6b14" />
          <stop offset="100%" stopColor="#7a5210" />
        </linearGradient>

        <linearGradient id="sl-metalH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8c06a" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#c8922a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8a5e18" stopOpacity="0.2" />
        </linearGradient>

        <radialGradient id="sl-panelGlow" cx="50%" cy="52%" r="52%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#fcd34d" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>

        <clipPath id="sl-bodyClip">
          <path d="M14 32 Q10 64 10 78 Q10 98 14 108 L66 108 Q70 98 70 78 Q70 64 66 32 Z" />
        </clipPath>
      </defs>

      <line
        x1="40"
        y1="0"
        x2="40"
        y2="14"
        stroke={night ? "#c8892a" : "#9a6b14"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="40" cy="2" r="2.5" fill={night ? "#d4a352" : "#b07820"} />

      <ellipse cx="40" cy="18" rx="20" ry="5" fill="url(#sl-metalG)" />
      <ellipse
        cx="40"
        cy="18"
        rx="20"
        ry="5"
        fill="url(#sl-metalH)"
        opacity="0.6"
      />
      <path d="M20 18 L24 30 L56 30 L60 18 Z" fill="url(#sl-metalG)" />
      <path
        d="M20 18 L24 30 L56 30 L60 18 Z"
        fill="url(#sl-metalH)"
        opacity="0.4"
      />
      <rect x="22" y="28" width="36" height="4" rx="2" fill="url(#sl-metalG)" />
      <rect
        x="22"
        y="28"
        width="36"
        height="2"
        rx="1"
        fill="url(#sl-metalH)"
        opacity="0.7"
      />

      <path
        d="M14 32 Q10 64 10 78 Q10 98 14 108 L22 108 L22 32 Z"
        fill={night ? "#0d0904" : "#d0bc90"}
      />
      <path
        d="M66 32 Q70 64 70 78 Q70 98 66 108 L58 108 L58 32 Z"
        fill={night ? "#100a04" : "#c8b488"}
      />

      <path
        d="M22 32 Q20 64 20 78 Q20 98 22 108 L58 108 Q60 98 60 78 Q60 64 58 32 Z"
        fill={night ? "url(#sl-bodyN)" : "url(#sl-bodyD)"}
      />

      {night && (
        <path
          d="M22 32 Q20 64 20 78 Q20 98 22 108 L58 108 Q60 98 60 78 Q60 64 58 32 Z"
          fill="url(#sl-panelGlow)"
        />
      )}

      <path
        d="M22 32 Q20 64 20 78 Q20 98 22 108 L34 108 L34 32 Z"
        fill="url(#sl-sheenL)"
      />
      <path d="M58 32 Q60 64 60 78 L60 55 L50 32 Z" fill="url(#sl-sheenR)" />

      {[22, 34.5, 47, 58].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1="32"
          x2={x}
          y2="108"
          stroke={night ? "#3a2408" : "#b8965a"}
          strokeWidth={i === 0 || i === 3 ? 1.5 : 0.8}
          opacity="0.9"
        />
      ))}

      <ellipse
        cx="40"
        cy="70"
        rx="20"
        ry="3.5"
        stroke={night ? "#3a2408" : "#b8965a"}
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />

      {night ? (
        <g clipPath="url(#sl-bodyClip)">
          <motion.ellipse
            cx="40"
            cy="70"
            rx="10"
            ry="16"
            fill="#f59e0b"
            opacity="0.22"
            animate={{
              ry: [16, 19, 14, 18, 16],
              cx: [40, 39.2, 40.6, 39.6, 40],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.ellipse
            cx="40"
            cy="71"
            rx="7"
            ry="12"
            fill="#fbbf24"
            opacity="0.55"
            animate={{
              ry: [12, 14.5, 10.5, 13.5, 12],
              cx: [40, 40.4, 39.5, 40.2, 40],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.ellipse
            cx="40"
            cy="72"
            rx="4"
            ry="7.5"
            fill="#fde68a"
            opacity="0.85"
            animate={{ ry: [7.5, 9, 6.5, 8.5, 7.5] }}
            transition={{
              duration: 0.85,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.ellipse
            cx="40"
            cy="72"
            rx="2"
            ry="3.5"
            fill="white"
            opacity="0.9"
            animate={{ ry: [3.5, 4.4, 3, 4, 3.5] }}
            transition={{
              duration: 0.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <path
            d="M22 32 Q20 64 20 78 Q20 98 22 108 L58 108 Q60 98 60 78 Q60 64 58 32 Z"
            fill="url(#sl-fg1)"
            opacity="0.55"
          />
        </g>
      ) : (
        <motion.g
          animate={{
            opacity: [0.6, 0.85, 0.62],
            scale: [0.97, 1.03, 0.98],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "40px 72px" }}
        >
          <ellipse cx="40" cy="70" rx="10" ry="14" fill="#fff4d0" opacity="0.5" />
          <ellipse cx="40" cy="71" rx="6" ry="9" fill="#ffe9a0" opacity="0.45" />
          <ellipse cx="40" cy="72" rx="3" ry="5" fill="#fffdf5" opacity="0.7" />
        </motion.g>
      )}

      <rect x="22" y="108" width="36" height="4" rx="2" fill="url(#sl-metalG)" />
      <rect
        x="22"
        y="108"
        width="36"
        height="2"
        rx="1"
        fill="url(#sl-metalH)"
        opacity="0.7"
      />
      <path d="M24 112 L20 122 L60 122 L56 112 Z" fill="url(#sl-metalG)" />
      <path
        d="M24 112 L20 122 L60 122 L56 112 Z"
        fill="url(#sl-metalH)"
        opacity="0.3"
      />
      <ellipse cx="40" cy="122" rx="20" ry="4.5" fill="url(#sl-metalG)" />
      <ellipse
        cx="40"
        cy="122"
        rx="20"
        ry="4.5"
        fill="url(#sl-metalH)"
        opacity="0.5"
      />

      <line
        x1="40"
        y1="126"
        x2="40"
        y2="135"
        stroke={night ? "#c8892a" : "#9a6b14"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <motion.ellipse
        cx="40"
        cy="137"
        rx="3.5"
        ry="2.2"
        fill={night ? "#d4a352" : "#b07820"}
        animate={{ ry: [2.2, 3, 1.8, 2.5, 2.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function TiltLantern({ night, size = 72 }: { night: boolean; size?: number }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-80, 80], [7, -7]), {
    stiffness: 55,
    damping: 16,
  });
  const ry = useSpring(useTransform(mx, [-80, 80], [-9, 9]), {
    stiffness: 55,
    damping: 16,
  });

  function onMouse(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left - r.width / 2);
    my.set(e.clientY - r.top - r.height / 2);
  }

  return (
    <motion.div
      onMouseMove={onMouse}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ perspective: 500, display: "inline-block" }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        style={{
          rotateX: rx,
          rotateY: ry,
          transformStyle: "preserve-3d",
        }}
      >
        <PremiumLantern size={size} night={night} />
      </motion.div>
    </motion.div>
  );
}

function AmbientParticles({ night }: { night: boolean }) {
  const dots = React.useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        x: `${(i * 29 + 11) % 98}%`,
        y: `${(i * 43 + 17) % 95}%`,
        size: 1 + (i % 4) * 0.75,
        dur: 2.2 + (i % 5) * 0.8,
        delay: (i * 0.18) % 5,
        color: night
          ? ["#e0e7ff", "#fef3c7", "#ddd6fe", "#fff", "#fde68a"][i % 5]
          : [
              "rgba(200,137,42,0.28)",
              "rgba(245,158,11,0.18)",
              "rgba(180,120,30,0.22)",
            ][i % 3],
      })),
    [night]
  );

  const blooms = React.useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: `${14 + i * 15}%`,
        y: `${8 + i * 14}%`,
        size: 100 + i * 55,
        dur: 7 + i * 1.8,
        delay: i * 1.1,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {dots.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{
            opacity: [0.05, 0.8, 0.05],
            scale: [0.6, 1.5, 0.6],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {blooms.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full"
          style={{
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            filter: "blur(22px)",
            background: night
              ? "radial-gradient(ellipse,rgba(251,191,36,.10) 0%,transparent 70%)"
              : "radial-gradient(ellipse,rgba(200,137,42,.06) 0%,transparent 70%)",
          }}
          animate={{
            opacity: [0.25, 0.65, 0.25],
            scale: [0.88, 1.14, 0.88],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function LanternInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  night,
  extra,
  onKeyDown,
  inputMode,
  autoComplete,
  autoFocus,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: React.ReactNode;
  night: boolean;
  extra?: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const accent = "#c8892a";

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        style={{
          fontSize: 9,
          letterSpacing: "0.26em",
          fontWeight: 700,
          textTransform: "uppercase",
          color: night ? "#7a5520" : "#9a7840",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {label}
      </label>

      <motion.div
        animate={focused ? { scale: 1.012 } : { scale: 1 }}
        transition={{ duration: 0.18 }}
        className="relative flex items-center"
        style={{
          height: 50,
          borderRadius: 13,
          background: night ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.78)",
          border: `1.5px solid ${
            focused
              ? accent
              : night
              ? "rgba(200,137,42,0.18)"
              : "rgba(200,160,80,0.32)"
          }`,
          boxShadow: focused
            ? night
              ? "0 0 0 4px rgba(200,137,42,0.10), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 0 0 4px rgba(200,137,42,0.08)"
            : night
            ? "inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 1px 3px rgba(0,0,0,0.04)",
          transition: "all 0.22s ease",
        }}
      >
        <span
          className="pointer-events-none absolute left-4"
          style={{
            color: focused ? accent : night ? "#4a3020" : "#c8a060",
            transition: "color 0.22s",
          }}
        >
          {icon}
        </span>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: "100%",
            paddingLeft: 38,
            paddingRight: extra ? 40 : 16,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 13,
            fontWeight: 500,
            color: night ? "#e8dcc8" : "#2a1e0e",
            fontFamily: "'DM Sans', sans-serif",
          }}
        />

        {extra}
      </motion.div>
    </div>
  );
}

function safeRedirectPath(value: string | null) {
  if (!value) return "/dashboard";

  try {
    const decoded = decodeURIComponent(value);

    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      decoded.toLowerCase() !== "/sign_in" &&
      decoded.toLowerCase() !== "/sign-in" &&
      !decoded.toLowerCase().startsWith("/sign_in?") &&
      !decoded.toLowerCase().startsWith("/sign-in?")
    ) {
      return decoded;
    }
  } catch {
    return "/dashboard";
  }

  return "/dashboard";
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shopCode, setShopCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [night, setNight] = useState(true);
  const [shake, setShake] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const redirectedRef = useRef(false);
  const expiredHandledRef = useRef(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const sessionError = String((session as any)?.error || "");
  const sessionAccessToken = String((session as any)?.accessToken || "");

  const safeNextPath = safeRedirectPath(
    searchParams.get("next") || searchParams.get("redirect")
  );

  useEffect(() => {
    const saved = localStorage.getItem("cutepos-theme");
    if (saved) setNight(saved === "night");
  }, []);

  useEffect(() => {
    localStorage.setItem("cutepos-theme", night ? "night" : "day");
  }, [night]);

  useEffect(() => {
    try {
      const rm =
        localStorage.getItem("remember_login") ||
        sessionStorage.getItem("remember_login");

      setRemember(rm !== "0");

      const sc =
        localStorage.getItem("shop_code") ||
        sessionStorage.getItem("shop_code") ||
        "";

      const un =
        localStorage.getItem("last_username") ||
        sessionStorage.getItem("last_username") ||
        "";

      if (sc) setShopCode(sc);
      if (un) setUsername(un);
    } catch {
      // ignore storage error
    }
  }, []);

  useEffect(() => {
    if (sessionError !== "AccessTokenExpired") return;
    if (expiredHandledRef.current) return;

    expiredHandledRef.current = true;

    const clearExpired = async () => {
      clearPosSession();
      clearAuthTokens();

      try {
        sessionStorage.removeItem("pos_access_token");
        sessionStorage.removeItem("pos_user");
      } catch {
        // ignore
      }

      await signOut({
        redirect: false,
      });
    };

    clearExpired();
  }, [sessionError]);

  useEffect(() => {
    if (redirectedRef.current) return;
    if (status === "loading") return;

    if (
      status === "authenticated" &&
      sessionError !== "AccessTokenExpired" &&
      sessionAccessToken
    ) {
      redirectedRef.current = true;

      const target = safeRedirectPath(safeNextPath);

      router.replace(target);
    }
  }, [router, safeNextPath, sessionAccessToken, sessionError, status]);

  const canSubmit =
    username.trim().length > 0 &&
    password.length > 0 &&
    shopCode.trim().length > 0 &&
    !submitting;

  const N = night;
  const accent = "#c8892a";
  const textPrimary = N ? "#e8dcc8" : "#1a1208";
  const textMuted = N ? "#6b5538" : "#9a8060";
  const cardBg = N ? "rgba(10,7,4,0.90)" : "rgba(255,255,255,0.93)";
  const cardBorder = N ? "rgba(200,137,42,0.22)" : "rgba(200,160,80,0.35)";

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimUser = username.trim();
    const trimShop = shopCode.trim().toUpperCase();

    setMsg("");

    if (!trimUser) {
      triggerShake();
      const t = "Username is required";
      setMsg(t);
      toast.error(t);
      return;
    }

    if (!password) {
      triggerShake();
      const t = "Password is required";
      setMsg(t);
      toast.error(t);
      return;
    }

    if (!trimShop) {
      triggerShake();
      const t = "Shop code is required";
      setMsg(t);
      toast.error(t);
      return;
    }

    setSubmitting(true);

    try {
      const callbackUrl = safeNextPath;

      const res = await signIn("credentials", {
        redirect: false,
        username: trimUser,
        password,
        shopCode: trimShop,
        callbackUrl,
      });

      if (!res) {
        throw new Error("No response from auth server.");
      }

      if (res.error) {
        triggerShake();

        const t =
          res.error === "CredentialsSignin"
            ? "Invalid username, password, or shop code"
            : res.error;

        setMsg(t);
        toast.error(t);
        return;
      }

      try {
        const nextSession = await getSession();
        const accessToken = String((nextSession as any)?.accessToken || "");

        if (accessToken) {
          saveToken(accessToken);
        }

        const sessionUser = (nextSession?.user || {}) as any;

        savePosSession({
          accessToken,
          user: {
            id: sessionUser.id,
            name: sessionUser.name,
            username: sessionUser.username || sessionUser.name || trimUser,
            role: sessionUser.role,
            shopId: sessionUser.shopId,
            shopCode: sessionUser.shopCode || trimShop,
            shopStatus:
              (nextSession as any)?.shopStatus || sessionUser.shopStatus,
            subscriptionPlan:
              (nextSession as any)?.subscriptionPlan ||
              sessionUser.subscriptionPlan,
            subscriptionEndDate:
              (nextSession as any)?.subscriptionEndDate ||
              sessionUser.subscriptionEndDate,
            image: sessionUser.image,
            imageUrl: sessionUser.imageUrl,
          },
          shopId: sessionUser.shopId,
          shopCode: sessionUser.shopCode || trimShop,
          shopStatus: (nextSession as any)?.shopStatus,
          subscriptionPlan: (nextSession as any)?.subscriptionPlan,
          subscriptionEndDate: (nextSession as any)?.subscriptionEndDate,
          features: (nextSession as any)?.features,
          limits: (nextSession as any)?.limits,
        });

        const store = remember ? localStorage : sessionStorage;
        const other = remember ? sessionStorage : localStorage;

        ["remember_login", "shop_code", "last_username"].forEach((k) =>
          other.removeItem(k)
        );

        store.setItem("remember_login", remember ? "1" : "0");
        store.setItem("shop_code", trimShop);
        store.setItem("last_username", trimUser);
      } catch {
        // session sync error should not block login redirect
      }

      toast.success(`Welcome back, ${trimUser}!`);

      redirectedRef.current = true;

      router.replace(callbackUrl);
    } catch (err: any) {
      triggerShake();

      const t = err?.message || "Login failed";

      setMsg(t);
      toast.error(t);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,700&display=swap');
        .cg { font-family: 'Cormorant Garamond', serif !important; }
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        ::placeholder { color: ${N ? "#3a2810" : "#c8a870"} !important; opacity: 1; }
      `}</style>

      <div
        className="relative min-h-[100dvh] overflow-hidden"
        style={{
          background: N
            ? "linear-gradient(155deg,#060409 0%,#0c0a12 38%,#100802 68%,#080510 100%)"
            : "linear-gradient(155deg,#f7f2ea 0%,#faf6f0 45%,#f2ece0 100%)",
          transition: "background 0.8s ease",
        }}
      >
        <AnimatePresence mode="wait">
          <AmbientParticles key={N ? "n" : "d"} night={N} />
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
            style={{
              background: N
                ? "rgba(251,191,36,0.08)"
                : "rgba(245,158,11,0.06)",
            }}
          />
          <div
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl"
            style={{
              background: N
                ? "rgba(217,119,6,0.09)"
                : "rgba(180,120,30,0.05)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.022]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "180px",
            }}
          />
        </div>

        <div className="relative z-20 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: accent }}
            />
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.28em",
                fontWeight: 700,
                color: N ? "#7a5520" : "#9a7040",
              }}
            >
              CUTEPOS
            </span>
          </div>

          <motion.button
            type="button"
            onClick={() => setNight((p) => !p)}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2.5 rounded-full px-4 py-1.5"
            style={{
              background: N ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)",
              border: N
                ? "1px solid rgba(200,137,42,0.2)"
                : "1px solid rgba(200,160,80,0.4)",
              backdropFilter: "blur(12px)",
              cursor: "pointer",
            }}
            aria-label="Toggle theme"
          >
            <PremiumLantern size={16} night={N} />
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: N ? "#c8892a" : "#9a7040",
              }}
            >
              {N ? "NIGHT" : "DAY"}
            </span>
          </motion.button>
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-68px)] max-w-5xl items-center px-5 pb-10 md:px-10">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="hidden flex-col items-start gap-10 lg:flex"
            >
              <div className="relative">
                <motion.div
                  className="pointer-events-none absolute"
                  style={{
                    width: 200,
                    height: 200,
                    top: -18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderRadius: "50%",
                    background: N
                      ? "radial-gradient(ellipse,rgba(251,191,36,0.22) 0%,rgba(245,158,11,0.06) 55%,transparent 75%)"
                      : "radial-gradient(ellipse,rgba(255,235,180,0.26) 0%,rgba(240,180,80,0.07) 55%,transparent 75%)",
                    filter: "blur(18px)",
                  }}
                />
                <TiltLantern night={N} size={88} />
              </div>

              <div
                style={{
                  width: 44,
                  height: 1,
                  background: N ? "#3a2810" : "#d0b878",
                }}
              />

              <div>
                <p
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.3em",
                    fontWeight: 700,
                    marginBottom: 14,
                    color: N ? "#7a5520" : "#c8892a",
                  }}
                >
                  {N ? "NIGHT SHIFT" : "MORNING SHIFT"}
                </p>

                <h1
                  className="cg"
                  style={{
                    fontSize: 52,
                    lineHeight: 1.06,
                    fontWeight: 300,
                    color: textPrimary,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {N ? (
                    <>
                      Sign in
                      <br />
                      under the
                      <br />
                      <em style={{ color: accent, fontWeight: 400 }}>
                        lantern light
                      </em>
                    </>
                  ) : (
                    <>
                      Sign in
                      <br />
                      with the
                      <br />
                      <em style={{ color: accent, fontWeight: 400 }}>
                        morning glow
                      </em>
                    </>
                  )}
                </h1>

                <p
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    lineHeight: 1.9,
                    color: textMuted,
                    maxWidth: 340,
                    letterSpacing: "0.025em",
                  }}
                >
                  {N
                    ? "The lantern burns so your shift begins. Enter your credentials to continue."
                    : "A new day, a new shift. Enter your credentials to open your workspace."}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  {
                    icon: <Store style={{ width: 12, height: 12 }} />,
                    text: "Shop code based authentication",
                  },
                  {
                    icon: <User style={{ width: 12, height: 12 }} />,
                    text: "Username & role auto-detected",
                  },
                  {
                    icon: <LogIn style={{ width: 12, height: 12 }} />,
                    text: "Session persists with Remember me",
                  },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      style={{
                        width: 26,
                        height: 1,
                        background: N ? "#5a3a15" : "#d0a848",
                      }}
                    />
                    <span style={{ color: accent }}>{f.icon}</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: textMuted,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {f.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                animate={
                  shake
                    ? { x: [-8, 8, -8, 8, -5, 5, -2, 2, 0] }
                    : { x: 0 }
                }
                transition={{ duration: 0.5 }}
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: "blur(28px)",
                  boxShadow: N
                    ? "0 40px 100px rgba(0,0,0,0.72), 0 0 80px rgba(200,137,42,0.06), inset 0 1px 0 rgba(255,255,255,0.04)"
                    : "0 28px 72px rgba(26,18,8,0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <div
                  style={{
                    height: 3,
                    background: N
                      ? "linear-gradient(90deg,#6a3a08 0%,#c8892a 45%,#6a3a08 100%)"
                      : "linear-gradient(90deg,#e0ccaa 0%,#c8892a 45%,#e0ccaa 100%)",
                  }}
                />

                <div className="flex flex-col gap-6 p-7 md:p-9">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        style={{
                          fontSize: 8.5,
                          letterSpacing: "0.28em",
                          fontWeight: 700,
                          marginBottom: 8,
                          color: N ? "#7a5520" : "#c8892a",
                        }}
                      >
                        {N ? "NIGHT SHIFT LOGIN" : "WELCOME BACK"}
                      </p>
                      <h2
                        className="cg"
                        style={{
                          fontSize: 32,
                          fontWeight: 300,
                          letterSpacing: "-0.01em",
                          color: textPrimary,
                          lineHeight: 1.1,
                        }}
                      >
                        Sign in
                      </h2>
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 11.5,
                          color: textMuted,
                        }}
                      >
                        Username · Shop Code · Password
                      </p>
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => setNight((p) => !p)}
                      whileHover={{ y: -4, scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      className="flex flex-col items-center gap-1 rounded-2xl border px-3 py-2.5"
                      style={{
                        background: N
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(250,245,238,0.9)",
                        borderColor: N
                          ? "rgba(200,137,42,0.16)"
                          : "rgba(200,160,80,0.35)",
                        cursor: "pointer",
                      }}
                    >
                      <PremiumLantern size={24} night={N} />
                      <span
                        style={{
                          fontSize: 7,
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          color: N ? "#c8892a" : "#9a7840",
                        }}
                      >
                        {N ? "NIGHT" : "DAY"}
                      </span>
                    </motion.button>
                  </div>

                  <div
                    style={{
                      height: 1,
                      background: N
                        ? "rgba(200,137,42,0.10)"
                        : "rgba(200,160,80,0.2)",
                    }}
                  />

                  <form
                    ref={formRef}
                    onSubmit={onSubmit}
                    noValidate
                    className="flex flex-col gap-5"
                  >
                    <LanternInput
                      night={N}
                      id="username"
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      icon={<User style={{ width: 14, height: 14 }} />}
                      autoComplete="username"
                      autoFocus
                    />

                    <LanternInput
                      night={N}
                      id="shopCode"
                      label="Shop Code"
                      value={shopCode}
                      onChange={(e) => setShopCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SHP-RNL"
                      icon={<Store style={{ width: 14, height: 14 }} />}
                      autoComplete="off"
                      extra={
                        <Hash
                          style={{
                            position: "absolute",
                            right: 14,
                            width: 13,
                            height: 13,
                            color: N ? "#3a2810" : "#c8a060",
                            pointerEvents: "none",
                          }}
                        />
                      }
                    />

                    <LanternInput
                      night={N}
                      id="password"
                      label="Password"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      icon={
                        <svg
                          style={{ width: 14, height: 14 }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      }
                      autoComplete="current-password"
                      extra={
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => !p)}
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: N ? "#4a3020" : "#c8a060",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {showPw ? (
                            <EyeOff style={{ width: 14, height: 14 }} />
                          ) : (
                            <Eye style={{ width: 14, height: 14 }} />
                          )}
                        </button>
                      }
                    />

                    <div className="flex items-center justify-between">
                      <label
                        className="flex cursor-pointer items-center gap-2.5"
                        style={{ fontSize: 11.5, color: textMuted }}
                      >
                        <div
                          className="relative flex h-4 w-4 cursor-pointer items-center justify-center rounded-[4px]"
                          style={{
                            border: `1.5px solid ${
                              remember ? accent : N ? "#3a2818" : "#c8a868"
                            }`,
                            background: remember
                              ? N
                                ? "rgba(200,137,42,0.15)"
                                : "rgba(200,137,42,0.08)"
                              : "transparent",
                            transition: "all 0.2s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="absolute h-full w-full cursor-pointer opacity-0"
                          />
                          {remember && (
                            <svg
                              style={{ width: 9, height: 9 }}
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M1.5 5L4 7.5L8.5 2.5"
                                stroke={accent}
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        Remember me
                      </label>

                      <a
                        href="/forgot"
                        style={{
                          fontSize: 11.5,
                          color: accent,
                          fontWeight: 600,
                          textDecoration: "none",
                          letterSpacing: "0.02em",
                        }}
                      >
                        Forgot password
                      </a>
                    </div>

                    <AnimatePresence>
                      {msg && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 11,
                            fontSize: 12,
                            background: N ? "rgba(60,10,10,0.55)" : "#fff1f2",
                            border: N
                              ? "1px solid rgba(200,50,50,0.25)"
                              : "1px solid #fecdd3",
                            color: N ? "#f87171" : "#dc2626",
                          }}
                        >
                          {msg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={!canSubmit}
                      whileHover={{
                        opacity: submitting ? 1 : 0.88,
                        y: submitting ? 0 : -2,
                      }}
                      whileTap={{ scale: 0.982 }}
                      style={{
                        height: 50,
                        width: "100%",
                        border: "none",
                        cursor: !canSubmit ? "not-allowed" : "pointer",
                        borderRadius: 13,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        fontFamily: "'DM Sans', sans-serif",
                        background: !canSubmit
                          ? N
                            ? "rgba(80,55,20,0.4)"
                            : "rgba(180,140,70,0.25)"
                          : N
                          ? "linear-gradient(135deg,#a07020 0%,#c8892a 45%,#d4a03a 100%)"
                          : "linear-gradient(135deg,#18130e 0%,#2a1e12 50%,#1a1410 100%)",
                        color: !canSubmit
                          ? N
                            ? "#5a4020"
                            : "#b09060"
                          : N
                          ? "#0a0703"
                          : "#f0e8d8",
                        boxShadow: canSubmit
                          ? N
                            ? "0 10px 32px rgba(200,137,42,0.38)"
                            : "0 10px 32px rgba(26,18,8,0.28)"
                          : "none",
                        transition: "all 0.22s ease",
                      }}
                    >
                      {submitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              border: "2px solid",
                              borderColor: "rgba(10,7,3,0.25)",
                              borderTopColor: N ? "#0a0703" : "#f0e8d8",
                            }}
                          />
                          <span>Signing in</span>
                        </>
                      ) : (
                        <>
                          <span>SIGN IN</span>
                          <ArrowRight style={{ width: 13, height: 13 }} />
                        </>
                      )}
                    </motion.button>

                    <p
                      style={{
                        textAlign: "center",
                        fontSize: 11.5,
                        color: textMuted,
                      }}
                    >
                      No account?{" "}
                      <a
                        href="/register"
                        style={{
                          color: accent,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Create one
                      </a>
                    </p>
                  </form>

                  <div
                    className="grid grid-cols-2 gap-2 rounded-xl p-3"
                    style={{
                      background: N
                        ? "rgba(255,255,255,0.018)"
                        : "rgba(250,245,235,0.85)",
                      border: `1px solid ${
                        N ? "rgba(200,137,42,0.08)" : "rgba(200,160,80,0.2)"
                      }`,
                    }}
                  >
                    {[
                      {
                        label: "AUTO ROLE",
                        text: "Role is detected from your username automatically.",
                      },
                      {
                        label: "SECURE SESSION",
                        text: "Remember me persists your session safely.",
                      },
                    ].map((item, i) => (
                      <div key={i}>
                        <p
                          style={{
                            fontSize: 7.5,
                            letterSpacing: "0.16em",
                            fontWeight: 700,
                            color: N ? "#7a5520" : "#b07820",
                            marginBottom: 4,
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontSize: 10.5,
                            color: textMuted,
                            lineHeight: 1.6,
                          }}
                        >
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontSize: 9.5,
                  letterSpacing: "0.06em",
                  color: N ? "#2e1e0e" : "#b8a080",
                }}
              >
                Click the lantern to switch between day & night mode
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}