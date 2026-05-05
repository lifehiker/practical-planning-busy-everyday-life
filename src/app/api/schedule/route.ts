import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { householdId, title, type, memberId, startAt, endAt, notes } = await req.json();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const block = await prisma.scheduleBlock.create({
    data: { householdId, title, type, memberId, startAt: new Date(startAt), endAt: new Date(endAt), notes },
    include: { member: { include: { user: true } } },
  });

  // Flag affected meal slots as needsReview
  await prisma.mealSlot.updateMany({
    where: {
      householdId,
      date: { gte: new Date(startAt), lte: new Date(endAt) },
      status: { not: "unplanned" },
    },
    data: { needsReview: true },
  });

  return NextResponse.json({ block });
}
