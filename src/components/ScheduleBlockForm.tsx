"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface ScheduleBlock {
  id: string;
  title: string;
  type: string;
  startAt: Date | string;
  endAt: Date | string;
  memberId: string;
  notes?: string | null;
  member: { user: { name: string | null } };
}

interface Props {
  householdId: string;
  members: Member[];
  currentMemberId: string;
  editBlock?: ScheduleBlock | null;
  onSaved: (block: ScheduleBlock) => void;
  onCancel: () => void;
}

function toInputValue(dt: Date | string) {
  const d = new Date(dt);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export default function ScheduleBlockForm({ householdId, members, currentMemberId, editBlock, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work");
  const [memberId, setMemberId] = useState(currentMemberId);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editBlock) {
      setTitle(editBlock.title);
      setType(editBlock.type);
      setMemberId(editBlock.memberId);
      setStartAt(toInputValue(editBlock.startAt));
      setEndAt(toInputValue(editBlock.endAt));
      setNotes("");
    }
  }, [editBlock]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startAt || !endAt) return;
    setLoading(true);
    try {
      const isEdit = editBlock?.id;
      const res = await fetch(isEdit ? `/api/schedule/${editBlock!.id}` : "/api/schedule", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdId, title, type, memberId, startAt, endAt, notes }),
      });
      if (!res.ok) throw new Error("Failed");
      const { block } = await res.json();
      toast.success(isEdit ? "Block updated" : "Block added");
      onSaved(block);
    } catch {
      toast.error("Failed to save block");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{editBlock?.id ? "Edit block" : "Add schedule block"}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Day Shift" required />
        </div>
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="home">Home</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Member</Label>
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.user.name ?? m.user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Start</Label>
          <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label>End</Label>
          <Input type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
