import { prisma } from "@/lib/prisma";

export async function getSubscriptionStatus(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  const isPro =
    sub?.status === "active" ||
    sub?.status === "trialing";

  return { isPro, subscription: sub };
}

export async function canAddMember(householdId: string, userId: string): Promise<boolean> {
  const { isPro } = await getSubscriptionStatus(userId);
  if (isPro) return true;

  const count = await prisma.householdMember.count({
    where: { householdId },
  });
  return count < 1; // free tier: max 1 member (just owner)
}

export async function canAddMealIdea(householdId: string, userId: string): Promise<boolean> {
  const { isPro } = await getSubscriptionStatus(userId);
  if (isPro) return true;

  const count = await prisma.mealIdea.count({
    where: { householdId },
  });
  return count < 10;
}

export async function getMaxPlanningDays(userId: string): Promise<number> {
  const { isPro } = await getSubscriptionStatus(userId);
  return isPro ? 30 : 7;
}
