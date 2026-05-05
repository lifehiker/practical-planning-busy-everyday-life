import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppSidebar from "@/components/AppSidebar";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) return children;

  const membership = await prisma.householdMember.findFirst({
    where: { userId: session.user.id },
    include: { household: true },
  });

  if (!membership) redirect("/onboarding");

  const user = {
    id: session.user.id,
    name: session.user.name ?? "You",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          householdName={membership.household.name}
          user={user}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar
            householdName={membership.household.name}
            user={user}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
