



// import { User } from "@/lib/models/User";
// import { dbConnect } from "@/lib/mongoDB";
// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import { v4 as uuid } from "uuid";

// // ✅ IMPORTANT: fs သုံးဖို့ Node runtime မဖြစ်မနေလို
// export const runtime = "nodejs";

// const REMOTE_BASE = process.env.REMOTE_API_BASE_URL;
// const TIMEOUT_MS = Number(process.env.REMOTE_API_TIMEOUT_MS || 2500);
// const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// function withTimeout(ms: number) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), ms);
//   return { controller, clear: () => clearTimeout(id) };
// }

// async function tryRemoteRegister(form: FormData) {
//   if (!REMOTE_BASE) return null;

//   const { controller, clear } = withTimeout(TIMEOUT_MS);
//   try {
//     const res = await fetch(`${REMOTE_BASE}/api/auth/register`, {
//       method: "POST",
//       body: form,
//       signal: controller.signal,
//     });

//     const text = await res.text();
//     let data: any;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { message: text };
//     }

//     return { ok: res.ok, status: res.status, data };
//   } catch {
//     return null;
//   } finally {
//     clear();
//   }
// }

// async function saveAvatarIfAny(form: FormData): Promise<string | undefined> {
//   const file = form.get("image") as File | null;
//   if (!file || file.size === 0) return undefined;

//   // validate
//   if (!file.type?.startsWith("image/")) throw new Error("Please select an image file");
//   if (file.size > 3 * 1024 * 1024) throw new Error("Image too large (max 3MB)");

//   // ext
//   let ext = path.extname(file.name || "").toLowerCase();
//   if (!ext) {
//     if (file.type === "image/jpeg") ext = ".jpg";
//     else if (file.type === "image/png") ext = ".png";
//     else if (file.type === "image/webp") ext = ".webp";
//     else ext = ".png";
//   }

//   const filename = `${uuid()}${ext}`;
//   const dirPath = path.join(process.cwd(), "public", "uploads", "avatars");
//   const savePath = path.join(dirPath, filename);

//   // ✅ make sure folder exists
//   await mkdir(dirPath, { recursive: true });

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   await writeFile(savePath, buffer);

//   // ✅ public folder ကနေ serve 되는 url
//   return `/uploads/avatars/${filename}`;
// }

// async function localRegister(form: FormData) {
//   await dbConnect();

//   const username = String(form.get("username") || "").trim().toLowerCase();
//   const password = String(form.get("password") || "");
//   const role = String(form.get("role") || "CASHIER") as "CASHIER" | "ADMIN";

//   if (!username) return NextResponse.json({ message: "Username is required" }, { status: 400 });
//   if (!password || password.length < 8)
//     return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });

//   const exists = await User.findOne({ username }).lean();
//   if (exists) return NextResponse.json({ message: "Username already exists" }, { status: 409 });

//   // ✅ save avatar (optional)
//   let avatarUrl: string | undefined;
//   try {
//     avatarUrl = await saveAvatarIfAny(form);
//   } catch (e: any) {
//     return NextResponse.json({ message: e?.message || "Invalid image" }, { status: 400 });
//   }

//   const passwordHash = await bcrypt.hash(password, 10);

//   const user = await User.create({
//     username,
//     passwordHash,
//     role,
//     isActive: true,
//     avatarUrl, // ✅ store
//   });

//   const access_token = jwt.sign(
//     { sub: String(user._id), username: user.username, role: user.role },
//     JWT_SECRET,
//     { expiresIn: "7d" }
//   );

//   return NextResponse.json({
//     access_token,
//     username: user.username,
//     role: user.role,
//     avatarPath: user.avatarUrl,
//     method: "local-mongo",
//   });
// }

// export async function POST(req: Request) {
//   const form = await req.formData();

//   const remote = await tryRemoteRegister(form);

//   if (remote?.ok) return NextResponse.json({ ...remote.data, method: "remote" }, { status: 200 });
//   if (remote && !remote.ok) return NextResponse.json(remote.data, { status: remote.status });

//   return await localRegister(form);
// }



export async function POST(req: Request) {
  const form = await req.formData();

  const res = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    body: form,
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
