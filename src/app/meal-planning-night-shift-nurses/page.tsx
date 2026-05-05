import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meal Planning for Night Shift Nurses | ShiftMeal",
  description: "Meal planning designed for nurses working 12-hour night shifts. Get smart suggestions for pre-shift prep, post-shift recovery meals, and family dinners.",
  keywords: ["meal planning night shift nurses", "nurse meal prep", "12 hour shift meal planning", "meal planner for nurses"],
};

export default function NightShiftNursesPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-4 py-3">
        <Link href="/" className="text-sm font-medium text-blue-600">← Back to ShiftMeal</Link>
      </nav>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Meal Planning for Night Shift Nurses</h1>
        <p className="text-xl text-gray-600 mb-8">
          Night shifts flip your entire rhythm. What you eat before, during, and after a 12-hour shift matters — but most meal apps have no idea you work nights.
        </p>
        <h2 className="text-2xl font-semibold mb-3">The Night Shift Meal Problem</h2>
        <p className="text-gray-600 mb-6">
          You&apos;re prepping dinner at 6pm before a 7pm shift. You get home at 8am and your family is waking up. The kids need lunch but you need to sleep. Your partner is trying to help but doesn&apos;t know what&apos;s planned. Standard meal planners show you a weekly grid — none of this fits.
        </p>
        <h2 className="text-2xl font-semibold mb-3">What ShiftMeal Does Differently</h2>
        <ul className="space-y-3 text-gray-600 mb-8">
          <li className="flex gap-3"><span className="text-blue-600">🌙</span> Knows which nights you&apos;re working — suggests quick pre-shift meals automatically</li>
          <li className="flex gap-3"><span className="text-blue-600">🏠</span> Shows who&apos;s home for each meal so your partner knows what&apos;s covered</li>
          <li className="flex gap-3"><span className="text-blue-600">⚡</span> Prioritizes low-effort meals when you have less than 90 minutes before your shift</li>
          <li className="flex gap-3"><span className="text-blue-600">🔄</span> If your shift changes, your meal plan gets flagged for review automatically</li>
        </ul>
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Meal planning that works for nurses</h3>
          <p className="text-gray-600 mb-4">Free to start. Takes 2 minutes to set up.</p>
          <Link href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Try ShiftMeal free
          </Link>
        </div>
      </article>
    </div>
  );
}
