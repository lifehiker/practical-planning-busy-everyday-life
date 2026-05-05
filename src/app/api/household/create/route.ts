import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, timezone } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const existing = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Already in a household" }, { status: 400 });
  }

  const household = await prisma.$transaction(async (tx) => {
    const h = await tx.household.create({
      data: {
        name: name.trim(),
        timezone: timezone || "America/New_York",
        ownerId: session.user!.id!,
      },
    });
    await tx.householdMember.create({
      data: {
        householdId: h.id,
        userId: session.user!.id!,
        role: "owner",
      },
    });
    // Seed starter meal ideas
    await tx.mealIdea.createMany({
      data: [
        { householdId: h.id, name: "Scrambled Eggs & Toast", prepEffort: "low", durationMin: 10, tags: ["quick", "breakfast"] },
        { householdId: h.id, name: "Pasta with Jarred Sauce", prepEffort: "low", durationMin: 20, tags: ["quick", "kid-friendly"] },
        { householdId: h.id, name: "Grilled Chicken & Veggies", prepEffort: "medium", durationMin: 40, tags: ["healthy"] },
      ],
    });
    return h;
  });

  return NextResponse.json({ household });
}
