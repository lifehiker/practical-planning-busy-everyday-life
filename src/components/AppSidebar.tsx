"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LayoutDashboard, Calendar, Utensils, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/meals", label: "Meals", icon: Utensils },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  householdName: string;
  user: { name: string; email: string; image: string | null };
}

export default function AppSidebar({ householdName, user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col bg-white border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-base">ShiftMeal</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">{householdName}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t">
        <div className="flex items-center gap-2 px-3 py-2">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} className="h-7 w-7 rounded-full" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
              {user.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
