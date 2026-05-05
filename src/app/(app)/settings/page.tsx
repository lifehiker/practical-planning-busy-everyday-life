import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus } from "@/lib/permissions";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";
import AccessRequiredState from "@/components/AccessRequiredState";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <AccessRequiredState
        title="Open household settings"
        description="Sign in to manage members, invitations, billing, and account preferences."
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
          invites: { where: { acceptedAt: null, expiresAt: { gt: new Date() } } },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

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
