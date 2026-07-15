import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withParsedTags } from "@/lib/tags";

interface RouteParams { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.mealSlot.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId: existing.householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { status, assignedMemberId, mealIdeaId, titleOverride, needsReview } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) {
    data.status = status;
    data.needsReview = false;
  }
  if (assignedMemberId !== undefined) data.assignedMemberId = assignedMemberId;
  if (mealIdeaId !== undefined) data.mealIdeaId = mealIdeaId;
  if (titleOverride !== undefined) data.titleOverride = titleOverride;
  if (needsReview !== undefined) data.needsReview = needsReview;

  const slot = await prisma.mealSlot.update({
    where: { id },
    data,
    include: {
      mealIdea: true,
      assignedMember: { include: { user: true } },
    },
  });

  return NextResponse.json({ slot: { ...slot, mealIdea: slot.mealIdea ? withParsedTags(slot.mealIdea) : null } });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.mealSlot.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId: existing.householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.mealSlot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
