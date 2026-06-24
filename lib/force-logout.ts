"use client";

import { signOut } from "next-auth/react";

let isLoggingOut = false;

export async function forceLogout(callbackUrl = "/Sign_in") {
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    localStorage.removeItem("remember_login");
    localStorage.removeItem("shop_code");
    localStorage.removeItem("last_username");
    localStorage.removeItem("sync-user");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-user");

    sessionStorage.removeItem("remember_login");
    sessionStorage.removeItem("shop_code");
    sessionStorage.removeItem("last_username");
    sessionStorage.removeItem("sync-user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth-user");
  } catch {}

  try {
    await signOut({
      redirect: false,
    });
  } catch {}

  window.location.href = callbackUrl;
}
