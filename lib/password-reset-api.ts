
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type ResetTokenValidationResponse = {
  valid: boolean;
  message?: string;
};

type BackendErrorResponse = {
  message?: string;
  error?: string;
};

export class PasswordResetApiError extends Error {
  status: number;
  invalidOrExpired: boolean;

  constructor(
    message: string,
    status = 500,
    invalidOrExpired = false,
  ) {
    super(message);

    this.name = "PasswordResetApiError";
    this.status = status;
    this.invalidOrExpired = invalidOrExpired;
  }
}

async function readJsonSafely<T>(
  response: Response,
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<ForgotPasswordResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
      cache: "no-store",
    },
  );

  const data =
    await readJsonSafely<
      ForgotPasswordResponse & BackendErrorResponse
    >(response);

  if (!response.ok) {
    throw new PasswordResetApiError(
      data?.message ||
        data?.error ||
        "Unable to send the password reset email.",
      response.status,
    );
  }

  return {
    message:
      data?.message ||
      "If an account exists for this email, a password reset link has been sent.",
  };
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ResetPasswordResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        newPassword,
        confirmPassword,
      }),
      cache: "no-store",
    },
  );

  const data =
    await readJsonSafely<
      ResetPasswordResponse & BackendErrorResponse
    >(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      "Unable to reset your password.";

    const normalizedMessage =
      message.toLowerCase();

    const invalidOrExpired =
      response.status === 400 &&
      (
        normalizedMessage.includes("invalid") ||
        normalizedMessage.includes("expired") ||
        normalizedMessage.includes("used")
      );

    throw new PasswordResetApiError(
      message,
      response.status,
      invalidOrExpired,
    );
  }

  return {
    message:
      data?.message ||
      "Password reset successful.",
  };
}

export async function validateResetToken(
  token: string,
): Promise<ResetTokenValidationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/reset-password/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    },
  );

  const data =
    await readJsonSafely<
      ResetTokenValidationResponse & BackendErrorResponse
    >(response);

  if (!response.ok) {
    throw new PasswordResetApiError(
      data?.message ||
        data?.error ||
        "Unable to validate the password reset link.",
      response.status,
      true,
    );
  }

  return {
    valid: data?.valid === true,
    message: data?.message,
  };
}
