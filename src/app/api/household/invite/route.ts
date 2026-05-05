import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/resend";
import { canAddMember } from "@/lib/permissions";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
    include: { household: true },
  });
  if (!membership) return NextResponse.json({ error: "Not household owner" }, { status: 403 });

  const canAdd = await canAddMember(membership.householdId, session.user.id);
  if (!canAdd) {
    return NextResponse.json({ error: "Upgrade to Pro to invite more members" }, { status: 403 });
  }

  const existingInvite = await prisma.invite.findFirst({
    where: { householdId: membership.householdId, email, acceptedAt: null },
  });
  if (existingInvite) {
    return NextResponse.json({ error: "Invite already sent to this email" }, { status: 400 });
  }

  const invite = await prisma.invite.create({
    data: {
      householdId: membership.householdId,
      email,
      role: "member",
      expiresAt: addDays(new Date(), 7),
    },
  });

  await sendInviteEmail({
    to: email,
    householdName: membership.household.name,
    inviterName: session.user.name ?? "Someone",
    token: invite.token,
  });

  return NextResponse.json({ success: true });
}
