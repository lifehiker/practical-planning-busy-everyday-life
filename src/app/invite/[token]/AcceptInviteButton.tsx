"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AcceptInviteButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function accept() {
    setLoading(true);
    try {
      const res = await fetch(`/api/invite/${token}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Joined household!");
      router.push("/dashboard");
    } catch {
      toast.error("Could not accept invite. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={accept} disabled={loading} className="w-full">
      {loading ? "Joining..." : "Accept Invitation"}
    </Button>
  );
}
