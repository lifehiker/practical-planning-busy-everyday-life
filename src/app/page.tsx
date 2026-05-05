import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ChefHat, Zap, ArrowRight, Check } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">ShiftMeal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-4">Built for nurses, shift workers and busy families</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Meal planning that works<br />
          <span className="text-blue-600">around your real schedule</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Stop forcing your irregular life into a generic weekly meal grid. ShiftMeal connects your work shifts and family schedule directly to meal decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signin">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">See how it works</Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">Free plan available - No credit card required</p>
      </section>
      {/* Problem */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">
            Sound familiar?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "1", text: "Your meal planner assumes a normal Mon-Sun week - yours never does." },
              { icon: "2", text: "You planned a big dinner, then realized someone works that evening." },
              { icon: "3", text: "Coordinating dinner across a household takes 6 texts and nobody knows who's cooking." },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-6 border text-center">
                <div className="text-3xl mb-3 font-semibold text-blue-600">{item.icon}</div>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features */}
      <section id="features" className="py-16 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
          How ShiftMeal works
        </h2>
        <p className="text-gray-600 text-center mb-12">Planning that adapts to your schedule, not the other way around.</p>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Calendar,
              title: "Block-based scheduling",
              description: "Add shifts, school days, travel, and home blocks. Not a generic calendar - real-life time blocks that drive every planning decision.",
            },
            {
              icon: Users,
              title: "Who's home tonight?",
              description: "Every meal slot shows who's actually home based on schedule overlap - so you never plan a big dinner when everyone's working.",
            },
            {
              icon: Clock,
              title: "Low-energy meal bank",
              description: "Save simple meals tagged by prep effort and time. When you have 20 minutes before a shift, ShiftMeal suggests what's actually realistic.",
            },
            {
              icon: Zap,
              title: "Auto-replanning",
              description: "Shift changed? ShiftMeal flags affected meals with one-click actions: keep it, mark leftovers, or pick something else.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">Simple pricing</h2>
          <p className="text-gray-600 text-center mb-12">Try free. Upgrade when your household grows.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">$0</p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                {["1 household member", "10 saved meal ideas", "7-day planning window", "Basic schedule blocks", "Basic meal planning"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">Get started free</Button>
              </Link>
            </div>
            <div className="bg-blue-600 text-white rounded-xl p-6 relative">
              <Badge className="absolute top-4 right-4 bg-white text-blue-600">Popular</Badge>
              <h3 className="font-bold text-lg mb-1">Pro Household</h3>
              <p className="text-3xl font-bold mb-1">$8.99<span className="text-base font-normal">/mo</span></p>
              <p className="text-blue-200 text-sm mb-4">or $69/year (save 36%)</p>
              <ul className="space-y-2 text-sm mb-6">
                {["Up to 5 household members", "Unlimited meal ideas", "30-day planning window", "Shared planning", "Replan after schedule changes", "Household tasks & logistics", "Priority support"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-200 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signin">
                <Button variant="secondary" className="w-full">Start free trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonial */}
      <section className="py-16 max-w-3xl mx-auto px-4 text-center">
        <p className="text-xl text-gray-700 italic mb-4">
          &quot;Finally a planner that doesn&#39;t assume I work 9-5. I&#39;m a night shift nurse and this is the first app that actually fits my life.&quot;
        </p>
        <p className="text-sm text-gray-500">- Early beta user, ICU nurse</p>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Start planning around your real schedule</h2>
          <p className="text-blue-100 mb-8">Free to try. Takes 2 minutes to set up. No credit card required.</p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">ShiftMeal</span>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-gray-600">
            <Link href="/shift-worker-meal-planner" className="hover:text-gray-900">Shift Workers</Link>
            <Link href="/meal-planning-night-shift-nurses" className="hover:text-gray-900">Nurses</Link>
            <Link href="/family-planner-irregular-hours" className="hover:text-gray-900">Families</Link>
            <Link href="/rotating-schedule-meal-prep" className="hover:text-gray-900">Rotating Shifts</Link>
          </nav>
          <p className="text-sm text-gray-500">(c) 2026 ShiftMeal</p>
        </div>
      </footer>
    </div>
  );
}
