"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { UserPlus, Mail, Crown, Trash2 } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface Invite {
  id: string;
  email: string;
  expiresAt: Date | string;
}

interface Household {
  id: string;
  name: string;
  timezone: string;
  members: Member[];
  invites: Invite[];
}

interface Props {
  household: Household;
  currentUserId: string;
  isOwner: boolean;
  isPro: boolean;
}

export default function SettingsClient({ household, currentUserId, isOwner, isPro }: Props) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch("/api/household/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/household/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Member removed");
      window.location.reload();
    } catch {
      toast.error("Failed to remove member");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Subscription Status */}
      <Card>
        <CardHeader><CardTitle className="text-base">Subscription</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
              {isPro && <Crown className="h-3 w-3" />}
              {isPro ? "Pro Household" : "Free Plan"}
            </Badge>
            {!isPro && (
              <span className="text-sm text-gray-500">
                Up to 1 member · 10 meal ideas · 7-day view
              </span>
            )}
          </div>
          {!isPro && (
            <form action="/api/billing/checkout" method="POST">
              <Button type="submit" size="sm" className="gap-1">
                <Crown className="h-4 w-4" /> Upgrade to Pro — $8.99/mo
              </Button>
            </form>
          )}
          {isPro && (
            <form action="/api/billing/portal" method="POST">
              <Button type="submit" variant="outline" size="sm">Manage billing</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Household */}
      <Card>
        <CardHeader><CardTitle className="text-base">Household: {household.name}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-3 text-gray-700">Members ({household.members.length})</p>
            <div className="space-y-2">
              {household.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {m.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.user.image} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {m.user.name?.[0] ?? m.user.email[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{m.user.name ?? m.user.email}</p>
                      <p className="text-xs text-gray-500">{m.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{m.role}</Badge>
                    {isOwner && m.user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(m.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending invites */}
          {household.invites.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 text-gray-700">Pending invites</p>
              {household.invites.map((inv) => (
                <div key={inv.id} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                  <Mail className="h-4 w-4" />
                  <span>{inv.email}</span>
                  <span className="text-xs text-gray-400">
                    expires {format(new Date(inv.expiresAt), "MMM d")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Invite form */}
          {isOwner && (
            <form onSubmit={sendInvite} className="flex gap-2 pt-2">
              <Input
                type="email"
                placeholder="Invite by email..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={inviting || !isPro} className="gap-1">
                <UserPlus className="h-4 w-4" />
                {inviting ? "Sending..." : "Invite"}
              </Button>
            </form>
          )}
          {isOwner && !isPro && (
            <p className="text-xs text-gray-500">
              Upgrade to Pro to invite household members.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
