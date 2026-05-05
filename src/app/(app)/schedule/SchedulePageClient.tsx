"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { toast } from "sonner";
import ScheduleBlockForm from "@/components/ScheduleBlockForm";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface ScheduleBlock {
  id: string;
  title: string;
  type: string;
  startAt: Date | string;
  endAt: Date | string;
  memberId: string;
  member: { user: { name: string | null } };
}

interface Household {
  id: string;
  name: string;
  members: Member[];
  scheduleBlocks: ScheduleBlock[];
}

interface Props {
  household: Household;
  currentMemberId: string;
}

const TYPE_COLORS: Record<string, string> = {
  work: "bg-red-100 text-red-800 border-red-200",
  school: "bg-orange-100 text-orange-800 border-orange-200",
  travel: "bg-purple-100 text-purple-800 border-purple-200",
  busy: "bg-gray-100 text-gray-800 border-gray-200",
  home: "bg-green-100 text-green-800 border-green-200",
};

export default function SchedulePageClient({ household, currentMemberId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(household.scheduleBlocks);
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = startOfWeek(addDays(new Date(), weekOffset * 7), { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  async function deleteBlock(id: string) {
    if (!confirm("Delete this schedule block?")) return;
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Block deleted");
    } catch {
      toast.error("Failed to delete block");
    }
  }

  function onSaved(block: ScheduleBlock) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === block.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = block;
        return next;
      }
      return [...prev, block];
    });
    setShowForm(false);
    setEditingBlock(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <Button onClick={() => { setEditingBlock(null); setShowForm(true); }} className="gap-1">
          <Plus className="h-4 w-4" /> Add block
        </Button>
      </div>

      {(showForm || editingBlock) && (
        <Card>
          <CardContent className="p-4">
            <ScheduleBlockForm
              householdId={household.id}
              members={household.members}
              currentMemberId={currentMemberId}
              editBlock={editingBlock}
              onSaved={onSaved}
              onCancel={() => { setShowForm(false); setEditingBlock(null); }}
            />
          </CardContent>
        </Card>
      )}

      {/* Quick add templates */}
      {!showForm && !editingBlock && (
        <div className="flex flex-wrap gap-2">
          <p className="text-sm text-gray-500 w-full">Quick add:</p>
          {[
            { label: "Day Shift", type: "work", hours: { start: 7, end: 15 } },
            { label: "Night Shift", type: "work", hours: { start: 19, end: 7 } },
            { label: "School", type: "school", hours: { start: 8, end: 15 } },
            { label: "Travel Day", type: "travel", hours: { start: 6, end: 22 } },
          ].map((tmpl) => (
            <Button
              key={tmpl.label}
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), tmpl.hours.start);
                const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (tmpl.hours.end < tmpl.hours.start ? 1 : 0), tmpl.hours.end);
                setEditingBlock({
                  id: "",
                  title: tmpl.label,
                  type: tmpl.type,
                  startAt: start,
                  endAt: end,
                  memberId: currentMemberId,
                  member: { user: { name: null } },
                });
                setShowForm(true);
              }}
            >
              {tmpl.label}
            </Button>
          ))}
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>← Prev</Button>
        <span className="text-sm font-medium">
          {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>Next →</Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayBlocks = blocks.filter((b) => isSameDay(new Date(b.startAt), day));
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="min-h-[80px]">
              <div className={`text-center py-1 text-xs font-medium mb-1 rounded ${isToday ? "bg-blue-600 text-white" : "text-gray-600"}`}>
                <div>{format(day, "EEE")}</div>
                <div>{format(day, "d")}</div>
              </div>
              <div className="space-y-0.5">
                {dayBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`text-xs rounded px-1 py-0.5 border cursor-pointer ${TYPE_COLORS[block.type] ?? "bg-gray-100"}`}
                    title={`${block.title} (${block.member.user.name ?? "?"})`}
                    onClick={() => { setEditingBlock(block); setShowForm(false); }}
                  >
                    <div className="font-medium truncate">{block.title}</div>
                    <div className="text-[10px] opacity-70">{format(new Date(block.startAt), "h:mm a")}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        <h2 className="font-semibold text-gray-700 mt-4">All upcoming blocks</h2>
        {blocks.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">No schedule blocks yet. Add your first shift above.</p>
        )}
        {blocks.map((block) => (
          <Card key={block.id}>
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{block.title}</span>
                  <Badge className={TYPE_COLORS[block.type]} variant="outline">{block.type}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(new Date(block.startAt), "EEE, MMM d h:mm a")} – {format(new Date(block.endAt), "h:mm a")}
                  {" · "}{block.member.user.name ?? "?"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingBlock(block)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteBlock(block.id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
