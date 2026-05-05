import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAddMealIdea } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { householdId, name, prepEffort, durationMin, tags, notes } = await req.json();

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, householdId },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const allowed = await canAddMealIdea(householdId, session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Free tier limit reached. Upgrade to Pro for unlimited meal ideas." }, { status: 403 });
  }

  const idea = await prisma.mealIdea.create({
    data: {
      householdId,
      name,
      prepEffort: prepEffort ?? "low",
      durationMin: durationMin ?? 30,
      tags: tags ?? [],
      notes,
    },
  });

  return NextResponse.json({ idea });
}
