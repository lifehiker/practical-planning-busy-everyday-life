import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBillingPortalSession } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const portal = await createBillingPortalSession({
    userId: session.user.id,
    returnUrl: `${appUrl}/settings`,
  });

  return NextResponse.redirect(portal.url);
}
