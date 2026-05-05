import { addDays, startOfDay, endOfDay, differenceInMinutes } from "date-fns";

type BlockType = "work" | "school" | "travel" | "busy" | "home";

interface ScheduleBlock {
  id: string;
  memberId: string;
  type: string;
  startAt: Date;
  endAt: Date;
}

interface MealIdea {
  id: string;
  name: string;
  prepEffort: string;
  durationMin: number;
  tags: string[];
  notes: string | null;
}

interface MealSlot {
  id: string;
  date: Date;
  slotType: string;
  startAt: Date | null;
  status?: string;
}

interface HouseholdMember {
  id: string;
}

export function getMembersHomeForSlot(
  slot: MealSlot,
  members: HouseholdMember[],
  scheduleBlocks: ScheduleBlock[]
): string[] {
  const slotStart = slot.startAt ?? new Date(slot.date);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour window

  const busyTypes: BlockType[] = ["work", "school", "travel", "busy"];

  return members.filter((member) => {
    const isBusy = scheduleBlocks.some(
      (block) =>
        block.memberId === member.id &&
        busyTypes.includes(block.type as BlockType) &&
        block.startAt < slotEnd &&
        block.endAt > slotStart
    );
    return !isBusy;
  }).map((m) => m.id);
}

export function getMinutesUntilNextShift(
  memberId: string,
  afterTime: Date,
  scheduleBlocks: ScheduleBlock[]
): number {
  const workBlocks = scheduleBlocks
    .filter(
      (b) =>
        b.memberId === memberId &&
        ["work", "school", "travel", "busy"].includes(b.type) &&
        b.startAt > afterTime
    )
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  if (workBlocks.length === 0) return Infinity;
  return differenceInMinutes(workBlocks[0].startAt, afterTime);
}

export function suggestMealsForSlot(
  slot: MealSlot,
  mealIdeas: MealIdea[],
  members: HouseholdMember[],
  scheduleBlocks: ScheduleBlock[]
): { ideas: MealIdea[]; fallback: "leftovers" | "takeout" | null } {
  const homeMembers = getMembersHomeForSlot(slot, members, scheduleBlocks);

  if (homeMembers.length === 0) {
    return { ideas: [], fallback: "takeout" };
  }

  const slotStart = slot.startAt ?? new Date(slot.date);
  const minGap = Math.min(
    ...homeMembers.map((id) =>
      getMinutesUntilNextShift(id, slotStart, scheduleBlocks)
    )
  );

  let filtered = mealIdeas;

  if (minGap < 90) {
    filtered = mealIdeas.filter((m) => m.prepEffort === "low" || m.durationMin <= 30);
  } else if (minGap < 180) {
    filtered = mealIdeas.filter((m) => m.prepEffort !== "high" || m.durationMin <= 60);
  }

  if (homeMembers.length >= 2) {
    filtered = mealIdeas; // all options available with multiple people home
  }

  const sorted = [...filtered].sort((a, b) => a.durationMin - b.durationMin);
  const top3 = sorted.slice(0, 3);

  if (top3.length === 0) {
    return { ideas: [], fallback: "leftovers" };
  }

  return { ideas: top3, fallback: null };
}

export function getAffectedMealSlotIds(
  changedBlock: ScheduleBlock,
  mealSlots: MealSlot[]
): string[] {
  const blockDate = startOfDay(changedBlock.startAt);
  const blockEnd = endOfDay(changedBlock.endAt);

  return mealSlots
    .filter((slot) => {
      const slotDate = startOfDay(slot.date);
      return slotDate >= blockDate && slotDate <= blockEnd;
    })
    .map((s) => s.id);
}

export function getNext3DaysSuggestions(
  today: Date,
  mealSlots: MealSlot[],
  mealIdeas: MealIdea[],
  members: HouseholdMember[],
  scheduleBlocks: ScheduleBlock[]
) {
  const next3Days = [today, addDays(today, 1), addDays(today, 2)];
  return next3Days.map((day) => {
    const daySlotsRaw = mealSlots.filter(
      (s) =>
        startOfDay(s.date).toDateString() === startOfDay(day).toDateString() &&
        s.status === "unplanned"
    );

    return {
      date: day,
      slots: daySlotsRaw.map((slot) => ({
        slot,
        ...suggestMealsForSlot(slot, mealIdeas, members, scheduleBlocks),
      })),
    };
  });
}
