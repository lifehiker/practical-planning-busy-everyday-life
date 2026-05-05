import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, type, memberId, startAt, endAt, notes } = await req.json();

  const existing = await prisma.scheduleBlock.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId: existing.householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const block = await prisma.scheduleBlock.update({
    where: { id },
    data: { title, type, memberId, startAt: new Date(startAt), endAt: new Date(endAt), notes },
    include: { member: { include: { user: true } } },
  });

  // Flag affected meal slots
  await prisma.mealSlot.updateMany({
    where: {
      householdId: existing.householdId,
      date: { gte: new Date(startAt), lte: new Date(endAt) },
      status: { not: "unplanned" },
    },
    data: { needsReview: true },
  });

  return NextResponse.json({ block });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.scheduleBlock.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId: existing.householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.scheduleBlock.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
