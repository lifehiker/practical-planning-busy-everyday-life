import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/permissions";
import SettingsClient from "./SettingsClient";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: {
      household: {
        include: {
          members: { include: { user: true } },
          invites: { where: { acceptedAt: null, expiresAt: { gt: new Date() } } },
        },
      },
    },
  });

  if (!membership) return null;

  const { isPro } = await getSubscriptionStatus(userId);

  return (
    <SettingsClient
      household={membership.household}
      currentUserId={userId}
      isOwner={membership.role === "owner"}
      isPro={isPro}
    />
  );
}
