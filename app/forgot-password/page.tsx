
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
} from "lucide-react";

import { PasswordRecoveryShell } from "@/components/auth/password-recovery-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PasswordResetApiError,
  requestPasswordReset,
} from "@/lib/password-reset-api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_SUCCESS_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    DEFAULT_SUCCESS_MESSAGE,
  );

  async function onSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await requestPasswordReset(
          normalizedEmail,
        );

      setSuccessMessage(
        response.message ||
          DEFAULT_SUCCESS_MESSAGE,
      );

      setSent(true);
    } catch (requestError) {
      if (
        requestError instanceof
        PasswordResetApiError
      ) {
        setError(requestError.message);
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to send the reset link. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PasswordRecoveryShell
      title="Forgot Password"
      description="Enter the email associated with your account and we’ll send password reset instructions."
    >
      {sent ? (
        <div
          className="space-y-6 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="space-y-2">
            <p className="font-medium">
              Check your email
            </p>

            <p className="text-sm leading-6 text-muted-foreground">
              {successMessage}
            </p>

            <p className="text-xs leading-5 text-muted-foreground">
              The password reset link will
              expire after a short time. If
              you do not see the email, check
              your spam or junk folder.
            </p>
          </div>

          <Button
            asChild
            className="h-11 w-full"
          >
            <Link href="/Sign_in">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full text-amber-700 dark:text-amber-400"
            onClick={() => {
              setSent(false);
              setError("");
            }}
          >
            Send another reset link
          </Button>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );
                  setError("");
                }}
                placeholder="owner@example.com"
                autoComplete="email"
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error
                    ? "forgot-error"
                    : undefined
                }
                className="h-11 pl-9"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div
              id="forgot-error"
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="h-11 w-full"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </Button>

          <Button
            asChild
            variant="link"
            className="w-full text-amber-700 dark:text-amber-400"
          >
            <Link href="/Sign_in">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </form>
      )}
    </PasswordRecoveryShell>
  );
}
