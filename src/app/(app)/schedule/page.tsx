import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, addWeeks } from "date-fns";
import SchedulePageClient from "./SchedulePageClient";
import { redirect } from "next/navigation";
import AccessRequiredState from "@/components/AccessRequiredState";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <AccessRequiredState
        title="View your schedule"
        description="Sign in to track shifts, school blocks, travel, and home time for your household."
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
          scheduleBlocks: {
            where: {
              startAt: { gte: startOfWeek(new Date(), { weekStartsOn: 0 }) },
              endAt: { lte: endOfWeek(addWeeks(new Date(), 2), { weekStartsOn: 0 }) },
            },
            include: { member: { include: { user: true } } },
            orderBy: { startAt: "asc" },
          },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

  return (
    <SchedulePageClient
      household={membership.household}
      currentMemberId={membership.id}
    />
  );
}
