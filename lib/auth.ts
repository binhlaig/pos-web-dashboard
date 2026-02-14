// // /lib/auth.ts
// import type { NextAuthOptions } from "next-auth";
// import Credentials from "next-auth/providers/credentials";

// type SpringLoginResponse = {
//   token: string;
//   tokenType?: string; // "Bearer"
// };

// function decodeJwtPayload(token: string): any | null {
//   try {
//     const base64 = token.split(".")[1];
//     const json = Buffer.from(base64, "base64").toString("utf8");
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   debug: true,
//   session: { strategy: "jwt" },

//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },

//       // async authorize(credentials) {
//       //   const username = String(credentials?.username || "").trim();
//       //   const password = String(credentials?.password || "");

//       //   if (!username || !password) {
//       //     throw new Error("Missing username or password");
//       //   }

//       //   const BACKEND_BASE =
//       //     process.env.REMOTE_API_BASE_URL || "http://localhost:8080";

//       //   const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
//       //     method: "POST",
//       //     headers: { "Content-Type": "application/json" },
//       //     body: JSON.stringify({ username, password }),
//       //   });

//       //   const text = await res.text().catch(() => "");

//       //   if (!res.ok) {
//       //     // Show useful backend error if available
//       //     let msg = text || `Auth server error (${res.status})`;
//       //     try {
//       //       const j = JSON.parse(text || "{}");
//       //       msg = j?.message || j?.detail || j?.error || msg;
//       //     } catch {}
//       //     throw new Error(res.status === 401 ? msg || "Invalid username or password" : msg);
//       //   }

//       //   let data: SpringLoginResponse | null = null;
//       //   try {
//       //     data = JSON.parse(text || "{}");
//       //   } catch {
//       //     data = null;
//       //   }

//       //   if (!data?.token) {
//       //     throw new Error("Malformed login response (missing token)");
//       //   }

//       //   const payload = decodeJwtPayload(data.token);
//       //   const roles = payload?.roles;
//       //   const role =
//       //     Array.isArray(roles) && roles.length > 0 ? String(roles[0]) : "CASHIER";

//       //   // ✅ NextAuth user object (must include id)
//       //   // We'll store accessToken in jwt callback
//       //   return {
//       //     id: username,
//       //     username,
//       //     role,
//       //     accessToken: data.token,
//       //     tokenType: data.tokenType || "Bearer",
//       //   } as any;
//       // },


//       async authorize(credentials) {
//         const username = String(credentials?.username || "").trim();
//         const password = String(credentials?.password || "");
//         if (!username || !password) return null;

//         const BACKEND_BASE = process.env.REMOTE_API_BASE_URL|| "http://localhost:8080";

//         const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ username, password }),
//         });

//         if (!res.ok) return null;

//         const data = await res.json().catch(() => null);
//         if (!data?.token) return null;

//         // decode roles from JWT payload (optional)
//         let role = "CASHIER";
//         try {
//           const payload = JSON.parse(
//             Buffer.from(String(data.token).split(".")[1], "base64").toString("utf8")
//           );
//           const roles = payload?.roles;
//           if (Array.isArray(roles) && roles[0]) role = String(roles[0]);
//         } catch { }

//         return {
//           id: username,
//           username,
//           role,
//           accessToken: data.token,
//           tokenType: data.tokenType || "Bearer",
//         } as any;
//       }

//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.userId = (user as any).id;
//         token.username = (user as any).username;
//         token.role = (user as any).role;
//         token.accessToken = (user as any).accessToken; // ✅ Spring JWT stored
//         token.tokenType = (user as any).tokenType || "Bearer";
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       (session.user as any) = {
//         id: token.userId,
//         username: token.username,
//         role: token.role,
//       };

//       // ✅ expose token to client (so you can call /api/products with Bearer)
//       (session as any).accessToken = token.accessToken;
//       (session as any).tokenType = token.tokenType;

//       return session;
//     },
//   },

//   // pages: { signIn: "/login" },
// };


// /lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

type SpringLoginResponse = {
  token: string;
  tokenType?: string;
};

function decodeJwtPayload(token: string): any | null {
  try {
    const base64 = token.split(".")[1];
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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
        const username = String(credentials?.username || "").trim();
        const password = String(credentials?.password || "");
        if (!username || !password) return null;

        const BACKEND_BASE =
          process.env.REMOTE_API_BASE_URL || "http://localhost:8080";

        const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) return null;

        const data: SpringLoginResponse | null = await res.json().catch(() => null);
        if (!data?.token) return null;

        let role = "CASHIER";
        try {
          const payload = decodeJwtPayload(data.token);
          const roles = payload?.roles;
          if (Array.isArray(roles) && roles[0]) role = String(roles[0]);
        } catch {}

        return {
          id: username,
          username,
          role,
          accessToken: data.token,
          tokenType: data.tokenType || "Bearer",
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.tokenType = (user as any).tokenType || "Bearer";
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any) = {
        id: token.userId,
        username: token.username,
        role: token.role,
      };
      (session as any).accessToken = token.accessToken;
      (session as any).tokenType = token.tokenType;
      return session;
    },
  },
};
