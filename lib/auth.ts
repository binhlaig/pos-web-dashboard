// // /lib/auth.ts
// import type { NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";

// export const authOptions: NextAuthOptions = {
//   debug: true,
//   // Removed trustHost property
//   session: { strategy: "jwt" },
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) {
//           throw new Error("Missing username or password");
//         }

//         // Map to your NestJS DTO. If your backend uses "email" or "identifier",
//         // we provide them defensively as well.
//         const body = {
//           username: String(credentials.username).trim(),
//           password: String(credentials.password),
//           email: String(credentials.username).includes("@")
//             ? String(credentials.username).trim()
//             : undefined,
//           identifier: String(credentials.username).trim(),
//         };

//         const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;

//         const res = await fetch(url, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "omit",
//           body: JSON.stringify(body),
//         });

//         const text = await res.text().catch(() => "");
//         if (!res.ok) {
//           // 401 → invalid credentials; otherwise surface server error
//           throw new Error(
//             res.status === 401
//               ? (text || "Invalid username or password")
//               : (text || `Auth server error (${res.status})`)
//           );
//         }

//         const data = JSON.parse(text || "{}");
//         // Expect { ok: true, user: {...} }
//         if (!data?.ok || !data?.user) {
//           throw new Error("Malformed login response");
//         }

//         return {
//           id: String(data.user.id),
//           username: data.user.username,
//           role: data.user.role,
//           avatarUrl: data.user.avatarUrl ?? null,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.userId = (user as any).id;
//         token.username = (user as any).username;
//         token.role = (user as any).role;
//         token.avatarUrl = (user as any).avatarUrl ?? null;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       (session.user as any) = {
//         id: token.userId,
//         username: token.username,
//         role: token.role,
//         avatarUrl: token.avatarUrl ?? null,
//       };
//       return session;
//     },
//   },
// };





// /lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

type LoginResponse = {
  ok?: boolean;
  user?: {
    id: string | number;
    username: string;
    role: string;
    avatarUrl?: string | null;
  };
  message?: string;
  detail?: string;
  error?: string;
  method?: "remote" | "local-mongo";
};

export const authOptions: NextAuthOptions = {
  debug: true,
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        const username = String(credentials.username).trim();
        const password = String(credentials.password);

        const body = {
          username,
          password,
          email: username.includes("@") ? username : undefined,
          identifier: username,
        };

        // ✅ Always call local gateway
        const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        const url = `${base}/api/auth/login`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "omit",
          body: JSON.stringify(body),
        });

        const text = await res.text().catch(() => "");

        if (!res.ok) {
          // try parse error json
          let msg = text || `Auth server error (${res.status})`;
          try {
            const j = JSON.parse(text || "{}");
            msg = j?.message || j?.detail || j?.error || msg;
          } catch {}
          // 401 => invalid creds
          throw new Error(res.status === 401 ? msg || "Invalid username or password" : msg);
        }

        let data: LoginResponse = {};
        try {
          data = JSON.parse(text || "{}");
        } catch {
          data = {};
        }

        // gateway/local must return { ok: true, user: {...} }
        if (!data?.ok || !data?.user) {
          throw new Error("Malformed login response");
        }

        return {
          id: String(data.user.id),
          username: data.user.username,
          role: data.user.role,
          avatarUrl: data.user.avatarUrl ?? null,
          // method ကို token ထဲထည့်ချင်ရင် session callback မှာထည့်လို့ရ
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // first login only
      if (user) {
        token.userId = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      (session.user as any) = {
        id: token.userId,
        username: token.username,
        role: token.role,
        avatarUrl: token.avatarUrl ?? null,
      };
      return session;
    },
  },

  // optional: custom pages
  // pages: { signIn: "/login" },
};
