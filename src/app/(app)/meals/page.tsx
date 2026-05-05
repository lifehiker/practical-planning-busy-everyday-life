import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfDay, addDays } from "date-fns";
import { getSubscriptionStatus } from "@/lib/permissions";
import MealsPageClient from "./MealsPageClient";

export const metadata = { title: "Meals" };

export default async function MealsPage() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: { include: { user: true } },
          mealIdeas: { orderBy: { createdAt: "desc" } },
          mealSlots: {
            where: {
              date: {
                gte: startOfDay(new Date()),
                lte: addDays(startOfDay(new Date()), 30),
              },
            },
            include: {
              mealIdea: true,
              assignedMember: { include: { user: true } },
            },
            orderBy: [{ date: "asc" }, { slotType: "asc" }],
          },
          scheduleBlocks: {
            where: {
              startAt: { gte: new Date() },
              endAt: { lte: addDays(new Date(), 30) },
            },
          },
        },
      },
    },
  });

  if (!membership) return null;

  const { isPro } = await getSubscriptionStatus(userId);

  return (
    <MealsPageClient
      household={membership.household}
      currentMemberId={membership.id}
      isPro={isPro}
    />
  );
}
