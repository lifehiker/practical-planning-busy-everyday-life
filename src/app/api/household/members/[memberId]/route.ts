import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { memberId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ownership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id, role: "owner" },
  });
  if (!ownership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const target = await prisma.householdMember.findUnique({ where: { id: memberId } });
  if (!target || target.householdId !== ownership.householdId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "owner") {
    return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 });
  }

  await prisma.householdMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
