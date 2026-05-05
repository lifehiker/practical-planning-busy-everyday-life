import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await upsertSubscription(userId, session.customer as string, sub);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await getUserIdFromCustomer(sub.customer as string);
      if (userId) await upsertSubscription(userId, sub.customer as string, sub);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "canceled", currentPeriodEnd: null },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(userId: string, customerId: string, sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      priceId: item?.price.id ?? null,
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      priceId: item?.price.id ?? null,
      currentPeriodEnd: new Date(periodEnd * 1000),
    },
  });
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const sub = await prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } });
  return sub?.userId ?? null;
}
