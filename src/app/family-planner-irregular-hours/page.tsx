import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Family Planner for Irregular Hours | ShiftMeal",
  description: "A shared family planner built for households where schedules are never the same two weeks in a row. Coordinate meals, shifts, and logistics together.",
  keywords: ["family planner irregular hours", "family meal planner irregular schedule", "shared household planning app"],
};

export default function FamilyPlannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-4 py-3">
        <Link href="/" className="text-sm font-medium text-blue-600">← Back to ShiftMeal</Link>
      </nav>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Family Planner for Irregular Hours</h1>
        <p className="text-xl text-gray-600 mb-8">
          When your household runs on multiple different schedules, coordination gets complicated fast. ShiftMeal connects everyone&apos;s schedule to your family&apos;s meal and task plan.
        </p>
        <h2 className="text-2xl font-semibold mb-3">The Shared Household Problem</h2>
        <p className="text-gray-600 mb-6">
          Partner A works day shifts. Partner B works evenings. One kid has after-school activities that change weekly. You&apos;re texting each other &quot;who&apos;s home for dinner?&quot; every single day. There are leftovers nobody touched because nobody planned around the actual schedule.
        </p>
        <h2 className="text-2xl font-semibold mb-3">One Shared View of Your Household</h2>
        <ul className="space-y-3 text-gray-600 mb-8">
          <li className="flex gap-3"><span className="text-blue-600">👨‍👩‍👧</span> All household members on one schedule board</li>
          <li className="flex gap-3"><span className="text-blue-600">🍽️</span> Meal slots show who&apos;s home and who&apos;s cooking</li>
          <li className="flex gap-3"><span className="text-blue-600">✅</span> Logistics tasks (groceries, school pickup, defrost dinner) assigned to the right person</li>
          <li className="flex gap-3"><span className="text-blue-600">📱</span> Everyone sees the same plan on their phone — no more daily texts</li>
        </ul>
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Stop coordinating by text</h3>
          <p className="text-gray-600 mb-4">Free for solo households. Pro plan for the whole family.</p>
          <Link href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get started free
          </Link>
        </div>
      </article>
    </div>
  );
}
