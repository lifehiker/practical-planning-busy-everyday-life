"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  householdName: string;
  user: { name: string; email: string; image: string | null };
}

export default function TopBar({ householdName, user }: TopBarProps) {
  return (
    <header className="bg-white border-b px-4 h-14 flex items-center justify-between md:justify-end">
      <div className="md:hidden">
        <p className="font-semibold text-sm">{householdName}</p>
      </div>
      <div className="flex items-center gap-2">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name} className="h-7 w-7 rounded-full" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
            {user.name[0]}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-1 text-gray-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
