import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

type SpringLoginResponse = {
  token: string;
  tokenType?: string;

  // backend က ဒီ field တစ်ခုခုနဲ့ real user id ပြန်ပေးနိုင်အောင် support
  id?: number | string | null;
  userId?: number | string | null;

  username?: string;
  role?: string;
  shopId?: number | string | null;
  shopCode?: string | null;
  imageUrl?: string | null;
  shopStatus?: string | null;
  subscriptionPlan?: string | null;
  subscriptionEndDate?: string | null;
  features?:
    | {
    allowRestaurant?: boolean;
    allowFashion?: boolean;
    allowAnalytics?: boolean;
    allowKitchen?: boolean;
    allowTableOrder?: boolean;
      }
    | string
    | null;
  limits?:
    | {
    maxStaff?: number | null;
    maxProducts?: number | null;
    maxReceiptsPerMonth?: number | null;
    maxStorageMb?: number | null;
    maxDevices?: number | null;
    maxBranches?: number | null;
      }
    | string
    | null;
};

function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return fallback;

  const text = value.trim();
  if (!text) return fallback;

  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function safeObject(value: unknown) {
  const parsed = safeJsonParse<unknown>(value, null);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  return parsed as Record<string, unknown>;
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const json = Buffer.from(padded, "base64").toString("utf8");
    return safeJsonParse(json, null);
  } catch {
    return null;
  }
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return null;
    return Number(payload.exp);
  } catch {
    return null;
  }
}

function isTokenExpired(exp?: number | null): boolean {
  if (!exp) return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds >= exp;
}

function firstValue(...values: unknown[]) {
  for (const value of values) {
    if (value == null) continue;

    const text = String(value).trim();
    if (text) return text;
  }

  return "";
}

function toNullableNumber(value: unknown): number | null {
  if (value == null) return null;

  const text = String(value).trim();
  if (!text) return null;

  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export const authOptions: NextAuthOptions = {
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        shopCode: { label: "Shop Code", type: "text" },
      },

      async authorize(credentials) {
        const username = String(credentials?.username || "").trim();
        const password = String(credentials?.password || "");
        const shopCode = String(credentials?.shopCode || "")
          .trim()
          .toUpperCase();

        if (!username || !password || !shopCode) {
          return null;
        }

        const BACKEND_BASE =
          process.env.REMOTE_API_BASE_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:8080";

        try {
          const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, shopCode }),
          });

          if (!res.ok) {
            return null;
          }

          const data: SpringLoginResponse | null = await res
            .json()
            .catch(() => null);

          if (!data?.token) {
            return null;
          }

          const payload = decodeJwtPayload(data.token);
          const exp = getTokenExpiry(data.token);

          const parsedUsername = firstValue(
            data.username,
            payload?.username,
            payload?.sub,
            username
          );

          const parsedUserId = firstValue(
            data.id,
            data.userId,
            payload?.id,
            payload?.userId,
            payload?.user_id,
            payload?.uid
          );

          const role = firstValue(
            data.role,
            payload?.role,
            payload?.roles,
            "CASHIER"
          );

          const parsedShopId = toNullableNumber(
            firstValue(data.shopId, payload?.shopId, payload?.shop_id)
          );

          const parsedShopCode = firstValue(
            data.shopCode,
            payload?.shopCode,
            payload?.shop_code,
            shopCode
          );

          const parsedImageUrl = firstValue(
            data.imageUrl,
            payload?.imageUrl,
            payload?.image_url,
            ""
          );

          const resultUser = {
            id: parsedUserId,

            name: parsedUsername,
            username: parsedUsername,
            role,

            shopId: parsedShopId,
            shopCode: parsedShopCode,

            image: parsedImageUrl || null,
            imageUrl: parsedImageUrl || null,

            accessToken: data.token,
            tokenType: data.tokenType || "Bearer",
            accessTokenExpires: exp,
            shopStatus: data.shopStatus ?? null,
            subscriptionPlan: data.subscriptionPlan ?? null,
            subscriptionEndDate: data.subscriptionEndDate ?? null,
            features: safeObject(data.features),
            limits: safeObject(data.limits),
          } as any;

          return resultUser;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;

        token.id = String(u.id || u.userId || "");
        token.userId = String(u.userId || u.id || "");
        token.username = String(u.username || u.name || "");
        token.role = String(u.role || "");
        token.shopId = u.shopId ?? null;
        token.shopCode = u.shopCode ?? null;
        token.image = u.image || u.imageUrl || null;

        token.accessToken = u.accessToken;
        token.tokenType = u.tokenType || "Bearer";
        token.accessTokenExpires = u.accessTokenExpires ?? null;
        token.shopStatus = u.shopStatus ?? null;
        token.subscriptionPlan = u.subscriptionPlan ?? null;
        token.subscriptionEndDate = u.subscriptionEndDate ?? null;
        token.features = safeObject(u.features);
        token.limits = safeObject(u.limits);
      }

      const expired = isTokenExpired(
        token.accessTokenExpires as number | null | undefined
      );

      if (expired) {
        token.error = "AccessTokenExpired";
        token.accessToken = null;
        token.shopStatus = null;
        token.subscriptionPlan = null;
        token.subscriptionEndDate = null;
        token.features = null;
        token.limits = null;
      } else {
        delete token.error;
      }

      return token;
    },

    async session({ session, token }) {
      try {
        const expired = isTokenExpired(
          token.accessTokenExpires as number | null | undefined
        );

        const safeUserId = firstValue(token.id, token.userId);
        const features = expired ? null : safeObject(token.features);
        const limits = expired ? null : safeObject(token.limits);

        session.user = {
          ...(session.user || {}),
          id: safeUserId,
          name: String(token.username || ""),
          username: String(token.username || ""),

          role: String(token.role || ""),
          shopId: token.shopId as number | null,
          shopCode: token.shopCode as string | null,

          image: (token.image as string | null) ?? null,
          avatarUrl: (token.image as string | null) ?? null,
          imageUrl: (token.image as string | null) ?? null,
          shopStatus: expired ? null : (token.shopStatus as string | null) ?? null,
          subscriptionPlan: expired ? null : (token.subscriptionPlan as string | null) ?? null,
          subscriptionEndDate: expired ? null : (token.subscriptionEndDate as string | null) ?? null,
        } as any;

        (session as any).accessToken = expired ? null : token.accessToken ?? null;
        (session as any).tokenType = token.tokenType || "Bearer";
        (session as any).error = expired
          ? "AccessTokenExpired"
          : token.error ?? null;

        (session as any).accessTokenExpires =
          (token.accessTokenExpires as number | null) ?? null;
        (session as any).shopStatus = expired ? null : token.shopStatus ?? null;
        (session as any).subscriptionPlan = expired ? null : token.subscriptionPlan ?? null;
        (session as any).subscriptionEndDate = expired ? null : token.subscriptionEndDate ?? null;
        (session as any).features = features;
        (session as any).limits = limits;

        return session;
      } catch {
        return {
          ...session,
          user: session.user || {},
          accessToken: null,
          error: "SessionMappingError",
          features: null,
          limits: null,
        } as any;
      }
    },
  },

  pages: {
    signIn: "/Sign_in",
  },
};
