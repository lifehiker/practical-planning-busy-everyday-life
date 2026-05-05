import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }
  return session;
}

export async function getHouseholdForUser(userId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: {
            include: { user: true },
          },
        },
      },
    },
  });
  return membership?.household ?? null;
}

export async function requireHousehold(userId: string) {
  const household = await getHouseholdForUser(userId);
  if (!household) {
    redirect("/onboarding");
  }
  return household;
}
