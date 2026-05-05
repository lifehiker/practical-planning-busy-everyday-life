import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  let customerId: string | undefined;
  const existingSub = await prisma.subscription.findUnique({ where: { userId } });
  if (existingSub?.stripeCustomerId) {
    customerId = existingSub.stripeCustomerId;
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : user.email ?? undefined,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
  });

  return session;
}

export async function createBillingPortalSession({
  userId,
  returnUrl,
}: {
  userId: string;
  returnUrl: string;
}) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub?.stripeCustomerId) throw new Error("No billing found");

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return session;
}
