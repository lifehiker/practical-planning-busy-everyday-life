import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeTags, withParsedTags } from "@/lib/tags";

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.mealIdea.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId: existing.householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, prepEffort, durationMin, tags, notes } = await req.json();

  const idea = await prisma.mealIdea.update({
    where: { id },
    data: { name, prepEffort, durationMin, tags: serializeTags(tags), notes },
  });

  return NextResponse.json({ idea: withParsedTags(idea) });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.mealIdea.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId: existing.householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.mealIdea.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
