"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  date: Date | string;
  completed: boolean;
  assignedMemberId: string | null;
  assignedMember?: { user: { name: string | null } } | null;
}

interface Member {
  id: string;
  user: { id: string; name: string | null; email: string };
}

interface Props {
  household: { id: string; members: Member[]; tasks: Task[] };
  currentMemberId: string;
}

export default function TasksPageClient({ household, currentMemberId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(household.tasks);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newAssignee, setNewAssignee] = useState(currentMemberId);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle) return;
    setAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdId: household.id, title: newTitle, date: newDate, assignedMemberId: newAssignee }),
      });
      if (!res.ok) throw new Error();
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setShowForm(false);
      toast.success("Task added");
    } catch {
      toast.error("Failed to add task");
    } finally {
      setAdding(false);
    }
  }

  async function toggleTask(id: string, completed: boolean) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed } : t));
    } catch {
      toast.error("Failed to update task");
    }
  }

  async function deleteTask(id: string) {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-1">
          <Plus className="h-4 w-4" /> Add task
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form onSubmit={addTask} className="space-y-3">
              <Input placeholder="Task title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              <div className="flex gap-2">
                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="flex-1" />
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {household.members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.user.name ?? m.user.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={adding}>{adding ? "Adding..." : "Add task"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {pending.length === 0 && done.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks yet.</p>
          <Button className="mt-3" onClick={() => setShowForm(true)}>Add your first task</Button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">To do ({pending.length})</h2>
          {pending.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Done ({done.length})</h2>
          {done.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: (id: string, c: boolean) => void; onDelete: (id: string) => void }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <button
          onClick={() => onToggle(task.id, task.completed)}
          className={cn("h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
            task.completed ? "bg-green-500 border-green-500" : "border-gray-300 hover:border-blue-500"
          )}
        >
          {task.completed && <Check className="h-3 w-3 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", task.completed && "line-through text-gray-400")}>{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{format(new Date(task.date), "MMM d")}</span>
            {task.assignedMember && (
              <Badge variant="outline" className="text-xs py-0">{task.assignedMember.user.name ?? "?"}</Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4 text-gray-400" />
        </Button>
      </CardContent>
    </Card>
  );
}
