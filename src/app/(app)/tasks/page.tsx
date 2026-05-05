import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import TasksPageClient from "./TasksPageClient";

export const metadata = { title: "Tasks" };

export default async function TasksPage() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: { include: { user: true } },
          tasks: {
            where: { date: { gte: new Date(Date.now() - 86400000) } },
            include: { assignedMember: { include: { user: true } } },
            orderBy: [{ completed: "asc" }, { date: "asc" }],
          },
        },
      },
    },
  });

  if (!membership) return null;

  return (
    <TasksPageClient
      household={membership.household}
      currentMemberId={membership.id}
    />
  );
}
