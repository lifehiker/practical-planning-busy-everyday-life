import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meal Planner for Shift Workers | ShiftMeal",
  description: "The only meal planner that works around rotating shifts and irregular hours. Built for nurses, EMS workers, retail managers, and their families.",
  keywords: ["meal planner for shift workers", "rotating schedule meal prep", "shift worker meal planning"],
};

export default function ShiftWorkerMealPlannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-4 py-3">
        <Link href="/" className="text-sm font-medium text-blue-600">← Back to ShiftMeal</Link>
      </nav>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Meal Planner for Shift Workers</h1>
        <p className="text-xl text-gray-600 mb-8">
          Standard meal planners assume you work 9–5. If you work nights, rotating shifts, or irregular hours, they break the moment your schedule changes. ShiftMeal is built differently.
        </p>
        <h2 className="text-2xl font-semibold mb-3">Why Regular Meal Planners Fail Shift Workers</h2>
        <p className="text-gray-600 mb-6">
          Most meal planning apps organize everything around a Monday-to-Sunday weekly grid. But if your shifts rotate every week, overlap into the next day, or change at short notice, a static weekly grid is useless. You end up planning dinners for nights you&apos;re working and leaving blank the nights you&apos;re home.
        </p>
        <h2 className="text-2xl font-semibold mb-3">How ShiftMeal Works</h2>
        <ul className="space-y-3 text-gray-600 mb-8">
          <li className="flex gap-3"><span className="text-blue-600 font-bold">1.</span> Add your shifts as time blocks — Day Shift, Night Shift, Travel, School pickup</li>
          <li className="flex gap-3"><span className="text-blue-600 font-bold">2.</span> ShiftMeal calculates who&apos;s home for each meal window</li>
          <li className="flex gap-3"><span className="text-blue-600 font-bold">3.</span> Get meal suggestions matched to your available prep time before the next shift</li>
          <li className="flex gap-3"><span className="text-blue-600 font-bold">4.</span> If your schedule changes, your meal plan updates automatically</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3">Built for Real Shift Work</h2>
        <p className="text-gray-600 mb-4">
          ShiftMeal handles the patterns that break other apps:
        </p>
        <ul className="space-y-2 text-gray-600 mb-8">
          <li>✓ Night shifts that end the next morning</li>
          <li>✓ Rotating 3-on/4-off or 12-hour schedules</li>
          <li>✓ Split households where partners work opposite shifts</li>
          <li>✓ Last-minute shift changes and swap coverage</li>
        </ul>
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Start planning around your actual schedule</h3>
          <p className="text-gray-600 mb-4">Free to start. No credit card required.</p>
          <Link href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get started free
          </Link>
        </div>
      </article>
    </div>
  );
}
