import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCheckoutSession } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const priceId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "";

  const checkout = await createCheckoutSession({
    userId: session.user.id,
    priceId,
    successUrl: `${appUrl}/settings?success=true`,
    cancelUrl: `${appUrl}/settings`,
  });

  return NextResponse.redirect(checkout.url ?? `${appUrl}/settings`);
}
