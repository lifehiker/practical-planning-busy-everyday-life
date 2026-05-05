import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay, addDays } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Utensils, CheckSquare, AlertTriangle, ArrowRight } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const membership = await prisma.householdMember.findFirst({
    where: { userId },
    include: { household: { include: { members: { include: { user: true } } } } },
  });

  if (!membership) return null;

  const { household } = membership;
  const today = startOfDay(new Date());
  const next7 = endOfDay(addDays(today, 6));

  const [upcomingBlocks, upcomingMeals, pendingTasks, needsReviewCount] = await Promise.all([
    prisma.scheduleBlock.findMany({
      where: { householdId: household.id, startAt: { gte: today, lte: next7 } },
      include: { member: { include: { user: true } } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
    prisma.mealSlot.findMany({
      where: { householdId: household.id, date: { gte: today, lte: next7 } },
      include: { mealIdea: true, assignedMember: { include: { user: true } } },
      orderBy: { date: "asc" },
      take: 6,
    }),
    prisma.task.count({
      where: { householdId: household.id, completed: false, date: { gte: today } },
    }),
    prisma.mealSlot.count({
      where: { householdId: household.id, needsReview: true },
    }),
  ]);

  const slotTypeColors: Record<string, string> = {
    breakfast: "bg-yellow-100 text-yellow-800",
    lunch: "bg-green-100 text-green-800",
    dinner: "bg-blue-100 text-blue-800",
    custom: "bg-purple-100 text-purple-800",
  };

  const blockTypeColors: Record<string, string> = {
    work: "bg-red-100 text-red-800",
    school: "bg-orange-100 text-orange-800",
    travel: "bg-purple-100 text-purple-800",
    busy: "bg-gray-100 text-gray-800",
    home: "bg-green-100 text-green-800",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {session.user!.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-gray-500 text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {needsReviewCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">
              {needsReviewCount} meal {needsReviewCount === 1 ? "slot needs" : "slots need"} review
            </p>
            <p className="text-sm text-amber-700 mt-1">A schedule change affected your meal plans.</p>
            <Link href="/meals" className="text-sm text-amber-800 font-medium mt-2 inline-flex items-center gap-1 hover:underline">
              Review now <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Link href="/schedule">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{upcomingBlocks.length}</p>
              <p className="text-xs text-gray-500">Shifts this week</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/meals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Utensils className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{upcomingMeals.filter(m => m.status !== "unplanned").length}</p>
              <p className="text-xs text-gray-500">Meals planned</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tasks">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <CheckSquare className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{pendingTasks}</p>
              <p className="text-xs text-gray-500">Open tasks</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming shifts</CardTitle>
              <Link href="/schedule"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingBlocks.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No shifts this week.</p>
            ) : (
              upcomingBlocks.map((block) => (
                <div key={block.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{block.title}</p>
                    <p className="text-xs text-gray-500">{format(block.startAt, "EEE, MMM d h:mm a")}</p>
                  </div>
                  <Badge className={blockTypeColors[block.type] ?? "bg-gray-100 text-gray-800"} variant="outline">
                    {block.type}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming meals</CardTitle>
              <Link href="/meals"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingMeals.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No meals planned yet.</p>
                <Link href="/meals"><Button size="sm" className="mt-2">Plan meals</Button></Link>
              </div>
            ) : (
              upcomingMeals.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">
                      {slot.mealIdea?.name ?? slot.titleOverride ?? slot.status}
                      {slot.needsReview && <span className="ml-1 text-amber-500">⚠</span>}
                    </p>
                    <p className="text-xs text-gray-500">{format(slot.date, "EEE, MMM d")}</p>
                  </div>
                  <Badge className={slotTypeColors[slot.slotType] ?? ""} variant="outline">
                    {slot.slotType}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/schedule">
          <Button variant="outline" className="w-full gap-2">
            <Calendar className="h-4 w-4" /> Add shift
          </Button>
        </Link>
        <Link href="/meals">
          <Button variant="outline" className="w-full gap-2">
            <Utensils className="h-4 w-4" /> Plan meal
          </Button>
        </Link>
        <Link href="/tasks">
          <Button variant="outline" className="w-full gap-2">
            <CheckSquare className="h-4 w-4" /> Add task
          </Button>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
