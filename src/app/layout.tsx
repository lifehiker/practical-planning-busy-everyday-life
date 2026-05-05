import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "ShiftMeal — Meal Planner for Shift Workers & Busy Families",
    template: "%s | ShiftMeal",
  },
  description: "Plan meals and household logistics around rotating shifts, school schedules, and messy real-life calendars. Built for busy families, nurses, and shift workers.",
  keywords: ["meal planner shift workers", "rotating schedule meal prep", "family planner app irregular hours", "meal planning night shift nurses", "household planning app"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shiftmeal.app",
    title: "ShiftMeal — Meal Planner for Shift Workers & Busy Families",
    description: "Plan meals and household logistics around rotating shifts.",
    siteName: "ShiftMeal",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
