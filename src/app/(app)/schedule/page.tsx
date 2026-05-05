import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, addWeeks } from "date-fns";
import SchedulePageClient from "./SchedulePageClient";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const session = await requireAuth();
  const userId = session.user!.id!;

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

  if (!membership) return null;

  return (
    <SchedulePageClient
      household={membership.household}
      currentMemberId={membership.id}
    />
  );
}
