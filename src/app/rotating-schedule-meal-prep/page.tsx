import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rotating Schedule Meal Prep | ShiftMeal",
  description: "Meal prep strategies and tools for rotating shift workers. Plan batch cooking around your actual schedule, not a generic weekly template.",
  keywords: ["rotating schedule meal prep", "meal planning for rotating shifts", "shift worker meal prep"],
};

export default function RotatingScheduleMealPrepPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b px-4 py-3">
        <Link href="/" className="text-sm font-medium text-blue-600">← Back to ShiftMeal</Link>
      </nav>
      <article className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Rotating Schedule Meal Prep</h1>
        <p className="text-xl text-gray-600 mb-8">
          Meal prep advice usually assumes you cook on Sunday for the week ahead. If your schedule rotates, that doesn&apos;t work. Here&apos;s a system that actually fits.
        </p>
        <h2 className="text-2xl font-semibold mb-3">Why &quot;Sunday Meal Prep&quot; Fails Rotating Schedules</h2>
        <p className="text-gray-600 mb-6">
          A rotating shift schedule means your days off vary week to week. Sometimes you have energy for batch cooking. Sometimes you just worked 3 nights in a row. The key is planning based on your actual upcoming schedule, not a generic weekly routine.
        </p>
        <h2 className="text-2xl font-semibold mb-3">A Smarter Approach</h2>
        <ul className="space-y-4 text-gray-600 mb-8">
          <li>
            <strong>Pre-shift meals:</strong> When ShiftMeal sees a shift starting in 90 minutes or less, it only suggests meals that take under 30 minutes. No more rushed, stressed cooking before work.
          </li>
          <li>
            <strong>Post-shift recovery:</strong> After a long shift, you need easy. ShiftMeal&apos;s meal idea bank lets you tag meals as &quot;freezer&quot; or &quot;quick&quot; so you always have low-effort options visible.
          </li>
          <li>
            <strong>Batch on your off days:</strong> Mark your off days and plan higher-effort meals or batch prep sessions for those windows. ShiftMeal shows you the gap before your next shift so you know how much time you actually have.
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mb-3">Build Your Meal Idea Bank</h2>
        <p className="text-gray-600 mb-4">
          Save 10–15 meals your household actually eats. Tag them by prep effort and duration. ShiftMeal uses your schedule to surface the right ones at the right time — no more staring at a blank weekly grid trying to invent a meal plan.
        </p>
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Meal prep that matches your real schedule</h3>
          <p className="text-gray-600 mb-4">Free to start. Add your shifts and your favorite meals.</p>
          <Link href="/auth/signin" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Start free
          </Link>
        </div>
      </article>
    </div>
  );
}
