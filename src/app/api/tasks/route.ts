import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { householdId, title, date, assignedMemberId } = await req.json();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const task = await prisma.task.create({
    data: { householdId, title, date: new Date(date), assignedMemberId },
    include: { assignedMember: { include: { user: true } } },
  });

  return NextResponse.json({ task });
}
