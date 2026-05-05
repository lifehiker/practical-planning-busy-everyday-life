import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMaxPlanningDays } from "@/lib/permissions";
import { addDays, startOfDay } from "date-fns";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { householdId, date, slotType, startAt, assignedMemberId } = await req.json();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const maxDays = await getMaxPlanningDays(session.user.id);
  const slotDate = new Date(date);
  const maxDate = addDays(startOfDay(new Date()), maxDays);
  if (slotDate > maxDate) {
    return NextResponse.json(
      { error: `Free tier is limited to ${maxDays} days. Upgrade to Pro for 30-day planning.` },
      { status: 403 }
    );
  }

  const slot = await prisma.mealSlot.create({
    data: {
      householdId,
      date: slotDate,
      slotType,
      startAt: startAt ? new Date(startAt) : null,
      assignedMemberId: assignedMemberId ?? null,
      status: "unplanned",
    },
    include: {
      mealIdea: true,
      assignedMember: { include: { user: true } },
    },
  });

  return NextResponse.json({ slot });
}
