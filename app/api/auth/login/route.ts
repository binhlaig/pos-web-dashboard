// import { NextResponse } from "next/server";
// import { dbConnect } from "@/lib/mongoDB";
// import { User } from "@/lib/models/User";
// import bcrypt from "bcryptjs";

// export const runtime = "nodejs";

// const REMOTE_BASE = process.env.REMOTE_API_BASE_URL;
// const TIMEOUT_MS = Number(process.env.REMOTE_API_TIMEOUT_MS || 2500);

// function withTimeout(ms: number) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), ms);
//   return { controller, clear: () => clearTimeout(id) };
// }

// // ✅ Remote login try (JSON)
// async function tryRemoteLogin(body: any) {
//   if (!REMOTE_BASE) return null;

//   const { controller, clear } = withTimeout(TIMEOUT_MS);
//   try {
//     const res = await fetch(`${REMOTE_BASE}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       signal: controller.signal,
//     });

//     const text = await res.text().catch(() => "");
//     let data: any;
//     try {
//       data = JSON.parse(text || "{}");
//     } catch {
//       data = { message: text };
//     }

//     return { ok: res.ok, status: res.status, data };
//   } catch {
//     return null; // network fail => fallback
//   } finally {
//     clear();
//   }
// }

// // ✅ Local login fallback (Mongo + bcrypt)
// async function localLogin(body: any) {
//   await dbConnect();

//   const username = String(body?.username || body?.identifier || "").trim().toLowerCase();
//   const password = String(body?.password || "");

//   if (!username || !password) {
//     return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
//   }

//   const user = await User.findOne({ username }).lean();
//   if (!user) {
//     return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
//   }

//   // isActive check (optional)
//   if (user.isActive === false) {
//     return NextResponse.json({ message: "Account is disabled" }, { status: 403 });
//   }

//   const ok = await bcrypt.compare(password, user.passwordHash);
//   if (!ok) {
//     return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
//   }

//   // ✅ match your NextAuth expectation: { ok: true, user: {...} }
//   return NextResponse.json({
//     ok: true,
//     user: {
//       id: String(user._id),
//       username: user.username,
//       role: user.role,
//       avatarUrl: user.avatarUrl ?? null,
//     },
//     method: "local-mongo",
//   });
// }

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));

//   // normalize body fields (same as your authorize)
//   const normalized = {
//     username: String(body?.username || body?.identifier || "").trim(),
//     password: String(body?.password || ""),
//     email:
//       String(body?.username || body?.identifier || "").includes("@")
//         ? String(body?.username || body?.identifier || "").trim()
//         : undefined,
//     identifier: String(body?.identifier || body?.username || "").trim(),
//   };

//   // 1) try remote first
//   const remote = await tryRemoteLogin(normalized);

//   // ✅ Remote success
//   if (remote?.ok) {
//     return NextResponse.json({ ...remote.data, method: "remote" }, { status: 200 });
//   }

//   // ✅ Remote reachable but error (401 invalid credentials etc.) => pass through
//   if (remote && !remote.ok) {
//     return NextResponse.json(remote.data, { status: remote.status });
//   }

//   // 2) network fail => fallback to local
//   return await localLogin(normalized);
// }



import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoDB";
import { User } from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const REMOTE_BASE = process.env.REMOTE_API_BASE_URL;
const TIMEOUT_MS = Number(process.env.REMOTE_API_TIMEOUT_MS || 2500);

function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
}

async function tryRemoteLogin(body: any) {
  if (!REMOTE_BASE) return null;

  const { controller, clear } = withTimeout(TIMEOUT_MS);

  try {
    const res = await fetch(`${REMOTE_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text().catch(() => "");
    let data: any;
    try {
      data = JSON.parse(text || "{}");
    } catch {
      data = { message: text };
    }

    // ✅ remote reachable (even if status not ok)
    return { ok: res.ok, status: res.status, data };
  } catch {
    // ❌ network/timeout => fallback
    return null;
  } finally {
    clear();
  }
}

async function localLogin(body: any) {
  await dbConnect();

  const usernameRaw = String(body?.username || body?.identifier || "").trim();
  const password = String(body?.password || "");

  const username = usernameRaw.toLowerCase();

  if (!username || !password) {
    return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
  }

  const user: any = await User.findOne({ username }).lean();

  if (!user) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  if (user.isActive === false) {
    return NextResponse.json({ message: "Account is disabled" }, { status: 403 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  // ✅ NextAuth authorize expects: { ok: true, user: {...} }
  return NextResponse.json({
    ok: true,
    user: {
      id: String(user._id),
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl ?? null,
    },
    method: "local-mongo",
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const username = String(body?.username || body?.identifier || "").trim();
  const password = String(body?.password || "");

  const normalized = {
    username,
    password,
    email: username.includes("@") ? username : undefined,
    identifier: username,
  };

  // 1) try remote first
  const remote = await tryRemoteLogin(normalized);

  // ✅ Remote success
  if (remote?.ok) {
    // remote should return { ok: true, user: {...} } ideally
    return NextResponse.json({ ...remote.data, method: "remote" }, { status: 200 });
  }

  // ✅ Remote reachable but error (401 etc.) => pass through (no fallback)
  if (remote && !remote.ok) {
    return NextResponse.json(remote.data, { status: remote.status });
  }

  // 2) network fail => fallback to local
  return await localLogin(normalized);
}
