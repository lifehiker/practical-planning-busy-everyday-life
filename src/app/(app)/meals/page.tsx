import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withParsedTags } from "@/lib/tags";
import { startOfDay, addDays } from "date-fns";
import { getSubscriptionStatus } from "@/lib/permissions";
import MealsPageClient from "./MealsPageClient";
import { redirect } from "next/navigation";
import AccessRequiredState from "@/components/AccessRequiredState";

export const metadata = { title: "Meals" };

export default async function MealsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <AccessRequiredState
        title="Open your meal plan"
        description="Sign in to manage meal ideas, assign dinners, and review schedule-driven meal changes."
      />
    );
  }

  const userId = session.user.id;

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

  if (!membership) redirect("/onboarding");

  const { isPro } = await getSubscriptionStatus(userId);

  // DB stores tags as a JSON string (SQLite); the client expects string[]
  const household = {
    ...membership.household,
    mealIdeas: membership.household.mealIdeas.map(withParsedTags),
    mealSlots: membership.household.mealSlots.map((slot) => ({
      ...slot,
      mealIdea: slot.mealIdea ? withParsedTags(slot.mealIdea) : null,
    })),
  };

  return (
    <MealsPageClient
      household={household}
      currentMemberId={membership.id}
      isPro={isPro}
    />
  );
}
