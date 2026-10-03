import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminSecret = process.env.ADMIN_SECRET || "janeyadmin2026";

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (password !== adminSecret) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Generate secure session token signed with secret
    const token = crypto
      .createHmac("sha256", adminSecret)
      .update(`admin-session-${new Date().toISOString().slice(0, 10)}`)
      .digest("hex");

    const res = NextResponse.json({ success: true, token });
    // Set HTTP-only cookie for admin
    res.cookies.set("janey_admin_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET || "janeyadmin2026";
  const cookieToken = req.cookies.get("janey_admin_auth")?.value;

  const validToken = crypto
    .createHmac("sha256", adminSecret)
    .update(`admin-session-${new Date().toISOString().slice(0, 10)}`)
    .digest("hex");

  if (cookieToken && cookieToken === validToken) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("janey_admin_auth");
  return res;
}
