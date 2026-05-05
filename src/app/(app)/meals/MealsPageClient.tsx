"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, addDays, startOfWeek, isSameDay, startOfDay } from "date-fns";
import { Plus, Trash2, Edit2, AlertTriangle, Check, ChevronLeft, ChevronRight, Utensils, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { suggestMealsForSlot, getMembersHomeForSlot } from "@/lib/scheduling";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
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
  date: Date | string;
  slotType: string;
  startAt: Date | string | null;
  status: string;
  assignedMemberId: string | null;
  mealIdeaId: string | null;
  titleOverride: string | null;
  needsReview: boolean;
  mealIdea: MealIdea | null;
  assignedMember: { user: { name: string | null } } | null;
}

interface ScheduleBlock {
  id: string;
  memberId: string;
  type: string;
  startAt: Date | string;
  endAt: Date | string;
}

interface Household {
  id: string;
  name: string;
  members: Member[];
  mealIdeas: MealIdea[];
  mealSlots: MealSlot[];
  scheduleBlocks: ScheduleBlock[];
}

interface Props {
  household: Household;
  currentMemberId: string;
  isPro: boolean;
}

const SLOT_TYPES = ["breakfast", "lunch", "dinner", "custom"];
const STATUSES = ["unplanned", "planned", "leftovers", "takeout", "skip"];
const EFFORT_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};
const STATUS_COLORS: Record<string, string> = {
  unplanned: "bg-gray-100 text-gray-600",
  planned: "bg-blue-100 text-blue-800",
  leftovers: "bg-orange-100 text-orange-800",
  takeout: "bg-purple-100 text-purple-800",
  skip: "bg-gray-100 text-gray-400",
};
const SLOT_TYPE_ICONS: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  custom: "⭐",
};

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

export default function MealsPageClient({ household, currentMemberId, isPro }: Props) {
  const [ideas, setIdeas] = useState<MealIdea[]>(household.mealIdeas);
  const [slots, setSlots] = useState<MealSlot[]>(household.mealSlots);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<MealIdea | null>(null);
  const [ideaName, setIdeaName] = useState("");
  const [ideaEffort, setIdeaEffort] = useState("low");
  const [ideaDuration, setIdeaDuration] = useState("30");
  const [ideaTags, setIdeaTags] = useState("");
  const [ideaNotes, setIdeaNotes] = useState("");
  const [savingIdea, setSavingIdea] = useState(false);
  const [editingSlot, setEditingSlot] = useState<MealSlot | null>(null);
  const [addingSlotDay, setAddingSlotDay] = useState<string | null>(null);
  const [slotType, setSlotType] = useState("dinner");
  const [slotStatus, setSlotStatus] = useState("unplanned");
  const [slotAssignee, setSlotAssignee] = useState("");
  const [slotMealIdeaId, setSlotMealIdeaId] = useState("");
  const [slotTitle, setSlotTitle] = useState("");
  const [savingSlot, setSavingSlot] = useState(false);
  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const schedBlocks = household.scheduleBlocks.map((b) => ({
    ...b,
    startAt: toDate(b.startAt),
    endAt: toDate(b.endAt),
  }));
  const members = household.members.map((m) => ({ id: m.id }));

  function openIdeaForm(idea?: MealIdea) {
    if (idea) {
      setEditingIdea(idea);
      setIdeaName(idea.name);
      setIdeaEffort(idea.prepEffort);
      setIdeaDuration(String(idea.durationMin));
      setIdeaTags(idea.tags.join(", "));
      setIdeaNotes(idea.notes ?? "");
    } else {
      setEditingIdea(null);
      setIdeaName("");
      setIdeaEffort("low");
      setIdeaDuration("30");
      setIdeaTags("");
      setIdeaNotes("");
    }
    setShowIdeaForm(true);
  }

  function openSlotForm(slot?: MealSlot, dayStr?: string) {
    if (slot) {
      setEditingSlot(slot);
      setSlotType(slot.slotType);
      setSlotStatus(slot.status);
      setSlotAssignee(slot.assignedMemberId ?? "");
      setSlotMealIdeaId(slot.mealIdeaId ?? "");
      setSlotTitle(slot.titleOverride ?? "");
    } else {
      setEditingSlot(null);
      setSlotType("dinner");
      setSlotStatus("unplanned");
      setSlotAssignee(currentMemberId);
      setSlotMealIdeaId("");
      setSlotTitle("");
      setAddingSlotDay(dayStr ?? null);
    }
  }

  function closeSlotForm() {
    setEditingSlot(null);
    setAddingSlotDay(null);
  }

  async function saveIdea(e: React.FormEvent) {
    e.preventDefault();
    setSavingIdea(true);
    try {
      const tags = ideaTags.split(",").map((t) => t.trim()).filter(Boolean);
      const body = { householdId: household.id, name: ideaName, prepEffort: ideaEffort, durationMin: parseInt(ideaDuration) || 30, tags, notes: ideaNotes || null };
      if (editingIdea) {
        const res = await fetch(`/api/meals/ideas/${editingIdea.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        const { idea } = await res.json();
        setIdeas((prev) => prev.map((i) => i.id === idea.id ? idea : i));
        toast.success("Meal idea updated");
      } else {
        const res = await fetch("/api/meals/ideas", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
        const { idea } = await res.json();
        setIdeas((prev) => [idea, ...prev]);
        toast.success("Meal idea added");
      }
      setShowIdeaForm(false);
      setEditingIdea(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save meal idea");
    } finally {
      setSavingIdea(false);
    }
  }

  async function deleteIdea(id: string) {
    if (!confirm("Delete this meal idea?")) return;
    try {
      await fetch(`/api/meals/ideas/${id}`, { method: "DELETE" });
      setIdeas((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function saveSlot(e: React.FormEvent) {
    e.preventDefault();
    setSavingSlot(true);
    try {
      if (editingSlot) {
        const res = await fetch(`/api/meals/slots/${editingSlot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: slotStatus,
            assignedMemberId: slotAssignee || null,
            mealIdeaId: slotMealIdeaId || null,
            titleOverride: slotTitle || null,
          }),
        });
        if (!res.ok) throw new Error();
        const { slot } = await res.json();
        setSlots((prev) => prev.map((s) => s.id === slot.id ? slot : s));
        toast.success("Meal slot updated");
      } else if (addingSlotDay) {
        const res = await fetch("/api/meals/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            householdId: household.id,
            date: addingSlotDay,
            slotType,
            assignedMemberId: slotAssignee || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
        const { slot } = await res.json();
        setSlots((prev) => [...prev, slot]);
        toast.success("Meal slot added");
      }
      closeSlotForm();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save slot");
    } finally {
      setSavingSlot(false);
    }
  }

  async function deleteSlot(id: string) {
    try {
      await fetch(`/api/meals/slots/${id}`, { method: "DELETE" });
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast.success("Slot removed");
    } catch {
      toast.error("Failed to remove slot");
    }
  }

  async function quickUpdateSlot(id: string, update: { status?: string; needsReview?: boolean; mealIdeaId?: string | null }) {
    try {
      const res = await fetch(`/api/meals/slots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error();
      const { slot } = await res.json();
      setSlots((prev) => prev.map((s) => s.id === slot.id ? slot : s));
    } catch {
      toast.error("Failed to update");
    }
  }

  const needsReviewCount = slots.filter((s) => s.needsReview).length;

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meals</h1>
        {needsReviewCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {needsReviewCount} need review
          </Badge>
        )}
      </div>
      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan">Meal Plan</TabsTrigger>
          <TabsTrigger value="ideas">
            Meal Ideas
            {ideas.length > 0 && <span className="ml-1.5 text-xs bg-gray-200 rounded-full px-1.5">{ideas.length}</span>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="space-y-4 mt-4">
          {slots.filter((s) => s.needsReview).map((slot) => (
            <Card key={slot.id} className="border-amber-300 bg-amber-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900">
                      {SLOT_TYPE_ICONS[slot.slotType]} {slot.slotType} on {format(toDate(slot.date), "EEE, MMM d")} needs review
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">A schedule change affected this meal. What would you like to do?</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => quickUpdateSlot(slot.id, { needsReview: false })}>
                    <Check className="h-3 w-3 mr-1" /> Keep as is
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => quickUpdateSlot(slot.id, { status: "leftovers" })}>
                    Leftovers
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => quickUpdateSlot(slot.id, { status: "takeout" })}>
                    Takeout
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { openSlotForm(slot); }}>
                    <Edit2 className="h-3 w-3 mr-1" /> Reassign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {days.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");
              const daySlots = slots.filter((s) => isSameDay(toDate(s.date), day));
              const isToday = isSameDay(day, new Date());
              const isPast = day < startOfDay(new Date());
              return (
                <Card key={dayStr} className={cn(isToday && "border-blue-400 shadow-sm")}>
                  <CardHeader className="py-2 px-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-semibold", isToday ? "text-blue-600" : isPast ? "text-gray-400" : "text-gray-800")}>
                          {format(day, "EEE, MMM d")}
                        </span>
                        {isToday && <Badge className="text-[10px] py-0 h-4">Today</Badge>}
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { openSlotForm(undefined, dayStr); setAddingSlotDay(dayStr); }}>
                        <Plus className="h-3 w-3" /> Add
                      </Button>
                    </div>
                  </CardHeader>
                  {(daySlots.length > 0 || (addingSlotDay === dayStr && !editingSlot)) && (
                    <CardContent className="px-3 pb-3 pt-0 space-y-2">
                      {daySlots.map((slot) => (
                        <SlotCard key={slot.id} slot={slot} members={household.members} scheduleBlocks={schedBlocks} onEdit={() => openSlotForm(slot)} onDelete={() => deleteSlot(slot.id)} />
                      ))}
                      {addingSlotDay === dayStr && !editingSlot && (
                        <form onSubmit={saveSlot} className="border rounded p-3 space-y-3 bg-gray-50">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label className="text-xs">Meal type</Label>
                              <Select value={slotType} onValueChange={setSlotType}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {SLOT_TYPES.map((t) => <SelectItem key={t} value={t}>{SLOT_TYPE_ICONS[t]} {t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs">Assign to</Label>
                              <Select value={slotAssignee} onValueChange={setSlotAssignee}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Anyone" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">Anyone</SelectItem>
                                  {household.members.map((m) => <SelectItem key={m.id} value={m.id}>{m.user.name ?? m.user.email}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setAddingSlotDay(null)}>Cancel</Button>
                            <Button type="submit" size="sm" disabled={savingSlot}>{savingSlot ? "Adding..." : "Add slot"}</Button>
                          </div>
                        </form>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="ideas" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {ideas.length}{!isPro && "/10"} meal ideas saved
              </p>
            </div>
            <Button size="sm" className="gap-1" onClick={() => openIdeaForm()}>
              <Plus className="h-4 w-4" /> Add idea
            </Button>
          </div>
          {showIdeaForm && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={saveIdea} className="space-y-3">
                  <div>
                    <Label>Meal name</Label>
                    <Input value={ideaName} onChange={(e) => setIdeaName(e.target.value)} placeholder="e.g. Sheet pan chicken" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Prep effort</Label>
                      <Select value={ideaEffort} onValueChange={setIdeaEffort}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (quick)</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High (involved)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration (min)</Label>
                      <Input type="number" value={ideaDuration} onChange={(e) => setIdeaDuration(e.target.value)} min={5} max={240} />
                    </div>
                  </div>
                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input value={ideaTags} onChange={(e) => setIdeaTags(e.target.value)} placeholder="e.g. freezer, quick, kid-friendly" />
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea value={ideaNotes} onChange={(e) => setIdeaNotes(e.target.value)} placeholder="Any prep notes..." rows={2} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => { setShowIdeaForm(false); setEditingIdea(null); }}>Cancel</Button>
                    <Button type="submit" disabled={savingIdea}>{savingIdea ? "Saving..." : editingIdea ? "Update" : "Add idea"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {ideas.length === 0 && !showIdeaForm && (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Utensils className="h-8 w-8 mx-auto text-gray-300" />
              <p>No meal ideas yet.</p>
              <p className="text-sm">Add simple meals your household enjoys — the app will suggest them when planning.</p>
              <Button className="mt-2" size="sm" onClick={() => openIdeaForm()}>Add your first meal idea</Button>
            </div>
          )}
          <div className="space-y-2">
            {ideas.map((idea) => (
              <Card key={idea.id}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{idea.name}</span>
                      <Badge className={cn("text-xs", EFFORT_COLORS[idea.prepEffort])}>{idea.prepEffort}</Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{idea.durationMin}m
                      </span>
                    </div>
                    {idea.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {idea.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-600">{tag}</span>
                        ))}
                      </div>
                    )}
                    {idea.notes && <p className="text-xs text-gray-500 mt-1">{idea.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openIdeaForm(idea)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteIdea(idea.id)}>
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {!isPro && ideas.length >= 10 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-sm text-amber-800 font-medium">Free tier limit reached</p>
              <p className="text-xs text-amber-700 mt-1">Upgrade to Pro for unlimited meal ideas.</p>
              <form action="/api/billing/checkout" method="POST" className="mt-3">
                <Button size="sm" type="submit">Upgrade to Pro</Button>
              </form>
            </div>
          )}
        </TabsContent>
      </Tabs>
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={closeSlotForm}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                {SLOT_TYPE_ICONS[editingSlot.slotType]} {editingSlot.slotType} — {format(toDate(editingSlot.date), "EEE, MMM d")}
              </h3>
            </div>
            <form onSubmit={saveSlot} className="p-4 space-y-3">
              <div>
                <Label>Status</Label>
                <Select value={slotStatus} onValueChange={setSlotStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meal idea</Label>
                <Select value={slotMealIdeaId} onValueChange={setSlotMealIdeaId}>
                  <SelectTrigger><SelectValue placeholder="None selected" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {ideas.map((idea) => (
                      <SelectItem key={idea.id} value={idea.id}>
                        {idea.name} ({idea.prepEffort}, {idea.durationMin}m)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Or type a meal name</Label>
                <Input value={slotTitle} onChange={(e) => setSlotTitle(e.target.value)} placeholder="e.g. Pizza night" />
              </div>
              <div>
                <Label>Assigned to</Label>
                <Select value={slotAssignee} onValueChange={setSlotAssignee}>
                  <SelectTrigger><SelectValue placeholder="Anyone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Anyone</SelectItem>
                    {household.members.map((m) => <SelectItem key={m.id} value={m.id}>{m.user.name ?? m.user.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <SuggestionPanel slot={editingSlot} ideas={ideas} members={members} scheduleBlocks={schedBlocks} onPick={(idea) => { setSlotMealIdeaId(idea.id); setSlotStatus("planned"); }} />
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={closeSlotForm}>Cancel</Button>
                <Button type="submit" disabled={savingSlot}>{savingSlot ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface SlotCardProps {
  slot: MealSlot;
  members: Member[];
  scheduleBlocks: { id: string; memberId: string; type: string; startAt: Date; endAt: Date }[];
  onEdit: () => void;
  onDelete: () => void;
}

function SlotCard({ slot, members, scheduleBlocks, onEdit, onDelete }: SlotCardProps) {
  const slotForScheduling = {
    id: slot.id,
    date: toDate(slot.date),
    slotType: slot.slotType,
    startAt: slot.startAt ? toDate(slot.startAt) : null,
    status: slot.status,
  };
  const membersForScheduling = members.map((m) => ({ id: m.id }));
  const homeIds = getMembersHomeForSlot(slotForScheduling, membersForScheduling, scheduleBlocks);
  const homeNames = members.filter((m) => homeIds.includes(m.id)).map((m) => m.user.name ?? m.user.email.split("@")[0]);
  const mealName = slot.mealIdea?.name ?? slot.titleOverride;
  return (
    <div className={cn("rounded-lg border p-2.5 text-sm", slot.needsReview ? "border-amber-300 bg-amber-50" : "bg-white")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base leading-none">{SLOT_TYPE_ICONS[slot.slotType]}</span>
            <span className="font-medium capitalize">{slot.slotType}</span>
            <Badge className={cn("text-[10px] py-0 h-4", STATUS_COLORS[slot.status])}>{slot.status}</Badge>
            {slot.needsReview && <Badge variant="destructive" className="text-[10px] py-0 h-4">Review</Badge>}
          </div>
          {mealName && <p className="text-xs text-gray-600 mt-0.5 font-medium">{mealName}</p>}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {slot.assignedMember && <span>👤 {slot.assignedMember.user.name ?? "?"}</span>}
            {homeNames.length > 0 && <span>🏠 {homeNames.join(", ")} home</span>}
            {homeNames.length === 0 && <span className="text-orange-500">No one home</span>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SuggestionPanelProps {
  slot: MealSlot;
  ideas: MealIdea[];
  members: { id: string }[];
  scheduleBlocks: { id: string; memberId: string; type: string; startAt: Date; endAt: Date }[];
  onPick: (idea: MealIdea) => void;
}

function SuggestionPanel({ slot, ideas, members, scheduleBlocks, onPick }: SuggestionPanelProps) {
  if (ideas.length === 0) return null;
  const slotForScheduling = {
    id: slot.id,
    date: toDate(slot.date),
    slotType: slot.slotType,
    startAt: slot.startAt ? toDate(slot.startAt) : null,
    status: slot.status,
  };
  const { ideas: suggested, fallback } = suggestMealsForSlot(slotForScheduling, ideas, members, scheduleBlocks);
  if (suggested.length === 0 && !fallback) return null;
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-xs font-medium text-blue-800">Suggestions based on schedule</span>
      </div>
      {fallback && (
        <p className="text-xs text-blue-700">
          {fallback === "takeout" ? "No one available to cook — consider takeout." : "Limited options — leftovers might work."}
        </p>
      )}
      <div className="space-y-1 mt-1">
        {suggested.map((idea) => (
          <button key={idea.id} type="button" onClick={() => onPick(idea)} className="w-full text-left rounded px-2 py-1.5 hover:bg-blue-100 transition-colors">
            <span className="text-xs font-medium text-blue-900">{idea.name}</span>
            <span className="text-[10px] text-blue-600 ml-2">{idea.prepEffort} · {idea.durationMin}m</span>
          </button>
        ))}
      </div>
    </div>
  );
}
