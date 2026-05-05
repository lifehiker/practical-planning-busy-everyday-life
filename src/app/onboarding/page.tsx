import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "./OnboardingForm";

export const metadata = { title: "Set up your household" };

export default async function OnboardingPage() {
  const session = await requireAuth();
  const userId = session.user!.id!;

  const existing = await prisma.householdMember.findFirst({ where: { userId } });
  if (existing) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Set up your household</h1>
          <p className="text-gray-600 mt-2">This takes about 1 minute.</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
