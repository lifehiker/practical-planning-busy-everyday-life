import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import TasksPageClient from "./TasksPageClient";
import { redirect } from "next/navigation";
import AccessRequiredState from "@/components/AccessRequiredState";

export const metadata = { title: "Tasks" };

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <AccessRequiredState
        title="Check household tasks"
        description="Sign in to manage chores, errands, and task assignments across your household."
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
          tasks: {
            where: { date: { gte: new Date(Date.now() - 86400000) } },
            include: { assignedMember: { include: { user: true } } },
            orderBy: [{ completed: "asc" }, { date: "asc" }],
          },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

  return (
    <TasksPageClient
      household={membership.household}
      currentMemberId={membership.id}
    />
  );
}
