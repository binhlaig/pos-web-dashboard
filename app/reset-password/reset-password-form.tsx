
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  X,
} from "lucide-react";

import { PasswordRecoveryShell } from "@/components/auth/password-recovery-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PasswordResetApiError,
  resetPassword,
  validateResetToken,
} from "@/lib/password-reset-api";

const REQUIREMENTS = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "One uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "One lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "One number",
    test: (value: string) => /\d/.test(value),
  },
];

type TokenState = "checking" | "valid" | "invalid";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          className="h-11 px-9 pr-10"
          disabled={disabled}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
          aria-label={
            visible
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token =
    searchParams.get("token")?.trim() || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenState, setTokenState] = useState<TokenState>("checking");

  // Reset success ဖြစ်သွားရင် ဒီ state ကို true လုပ်မယ်
  const [success, setSuccess] = useState(false);

  const passwordValid = useMemo(
    () =>
      REQUIREMENTS.every((requirement) =>
        requirement.test(password),
      ),
    [password],
  );

  useEffect(() => {
    let cancelled = false;

    async function checkToken() {
      if (!token) {
        setTokenState("invalid");
        return;
      }

      setTokenState("checking");

      try {
        const result = await validateResetToken(token);

        if (!cancelled) {
          setTokenState(result.valid ? "valid" : "invalid");
        }
      } catch {
        if (!cancelled) {
          setTokenState("invalid");
        }
      }
    }

    void checkToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading || !token || tokenState !== "valid") {
      return;
    }

    if (!passwordValid) {
      setError(
        "Your password does not meet all requirements.",
      );
      return;
    }

    if (password !== confirmation) {
      setError(
        "Confirm Password must match New Password.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(
        token,
        password,
        confirmation,
      );

      // Password field data ဖျက်
      setPassword("");
      setConfirmation("");

      // Form ကိုမပြတော့အောင် success true
      setSuccess(true);

      // URL ထဲက reset token ဖယ်
      router.replace(
        "/reset-password?success=1",
      );
    } catch (requestError) {
      if (
        requestError instanceof
          PasswordResetApiError &&
        requestError.invalidOrExpired
      ) {
        setTokenState("invalid");
        setError("");
        return;
      }

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset your password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Password reset အောင်မြင်သွားရင်
   * ဒီ UI ပဲပြမယ်။
   *
   * Password form ကို လုံးဝမပြတော့ဘူး။
   */
  if (success) {
    return (
      <PasswordRecoveryShell
        title="Password Reset Successful"
        description="Your password has been changed successfully."
      >
        <div
          className="space-y-6 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold">
              Password updated successfully
            </h2>

            <p className="text-sm leading-6 text-muted-foreground">
              Your Binhlaig POS password has
              been changed successfully.
            </p>

            <p className="text-sm leading-6 text-muted-foreground">
              You can now sign in to your
              account using your new password.
            </p>

            <p className="text-xs leading-5 text-muted-foreground">
              For your security, this password
              reset link can no longer be used.
            </p>
          </div>

          <Button
            type="button"
            className="h-11 w-full"
            onClick={() =>
              router.replace("/Sign_in")
            }
          >
            Back to Login
          </Button>
        </div>
      </PasswordRecoveryShell>
    );
  }

  if (tokenState === "checking") {
    return (
      <PasswordRecoveryShell
        title="Checking Reset Link"
        description="Please wait while we verify your password reset link."
      >
        <div className="py-6 text-center text-sm text-muted-foreground" role="status">
          Checking reset link...
        </div>
      </PasswordRecoveryShell>
    );
  }

  if (tokenState === "invalid") {
    return (
      <PasswordRecoveryShell
        title="Reset Link No Longer Valid"
        description="This password reset link has expired, is invalid, or has already been used."
      >
        <div className="space-y-6 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            For your security, password reset links can only be used once.
          </p>

          <Button asChild className="w-full">
            <Link href="/forgot-password">
              Request a New Reset Link
            </Link>
          </Button>

          <Button
            asChild
            variant="link"
            className="w-full text-amber-700 dark:text-amber-400"
          >
            <Link href="/Sign_in">Back to Login</Link>
          </Button>
        </div>
      </PasswordRecoveryShell>
    );
  }

  return (
    <PasswordRecoveryShell
      title="Reset Password"
      description="Choose a strong new password for your Binhlaig POS account."
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-5"
      >
        <PasswordField
              id="new-password"
              label="New Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setError("");
              }}
              disabled={loading}
            />

            <PasswordField
              id="confirm-password"
              label="Confirm Password"
              value={confirmation}
              onChange={(value) => {
                setConfirmation(value);
                setError("");
              }}
              disabled={loading}
            />

            <div
              className="rounded-lg border bg-muted/40 p-3"
              aria-label="Password requirements"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Password requirements
              </p>

              <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
                {REQUIREMENTS.map(
                  (requirement) => {
                    const met =
                      requirement.test(
                        password,
                      );

                    return (
                      <li
                        key={
                          requirement.label
                        }
                        className={
                          met
                            ? "flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                            : "flex items-center gap-2 text-muted-foreground"
                        }
                      >
                        {met ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}

                        {
                          requirement.label
                        }
                      </li>
                    );
                  },
                )}
              </ul>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={
                loading ||
                !passwordValid ||
                password !== confirmation
              }
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </Button>

        <Button
          asChild
          variant="link"
          className="w-full text-amber-700 dark:text-amber-400"
        >
          <Link href="/Sign_in">
            Back to Login
          </Link>
        </Button>
      </form>
    </PasswordRecoveryShell>
  );
}
