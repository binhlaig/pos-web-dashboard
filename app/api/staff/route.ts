import { Staff } from "@/lib/models/Staff";
import { dbConnect } from "@/lib/mongoDB";
import { error } from "console";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const payload = {
            name: String(body?.name || "").trim(),
            email: body?.email ? String(body.email).trim().toLowerCase() : undefined,
            phone: body?.phone ? String(body.phone).trim() : undefined,
            role: body?.role || "staff",
            isActive: body?.isActive ?? true,
            avatarUrl: body?.avatarUrl,
            passwordHash: body?.passwordHash,

        }
        if (!payload.name || !payload.email) {
            return new Response("Name and Email are required", { status: 400 });
        }

        const created = await Staff.create(payload);
        return NextResponse.json(created, { status: 201 });


    } catch (e: any) {
        if (e.code === 11000) {
            return NextResponse.json({ error: "Staff with this email already exists." }, { status: 409 });
        }
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });

    }
};