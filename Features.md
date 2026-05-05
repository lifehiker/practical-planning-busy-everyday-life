# Features: ShiftMeal

A meal planner for shift workers and irregular-schedule households. Built with Next.js 15, Prisma, NextAuth v5, Stripe, and Resend.

---

## Authentication
- **Description**: Users can sign in via Google OAuth or email magic link. No passwords to manage. Magic links are sent via Resend. NextAuth v5 handles sessions with the Prisma adapter persisting accounts, sessions, and verification tokens.
- **Status**: Completed
- **Implementation notes**: NextAuth v5 with Prisma adapter. Providers: GoogleProvider, EmailProvider (Resend transport). Session strategy: database sessions.
- **Date added**: 2026-05-05

---

## Household Management
- **Description**: Users create a household during onboarding and can invite other members by email. Invites are token-based. Members can be removed by the owner. Two roles exist: owner and member. The household is the central unit — all schedules, meals, and tasks are scoped to it.
- **Status**: Completed
- **Implementation notes**: Household model in Prisma. Invite tokens stored with expiry. Role field on HouseholdMember (owner/member). Owner-only actions enforced server-side.
- **Date added**: 2026-05-05

---

## Schedule Blocks
- **Description**: Each household member can create time blocks on a weekly grid to represent their schedule. Block types: work, school, travel, busy, home. Blocks can be created, edited, and deleted. Two views available: week grid and list view. Quick-add templates for common patterns: Day Shift, Night Shift, School, Travel Day.
- **Status**: Completed
- **Implementation notes**: ScheduleBlock model with memberId, type, startTime, endTime, date. Week grid renders blocks by day column. Quick-add templates pre-fill the form with sensible defaults.
- **Date added**: 2026-05-05

---

## Meal Ideas Bank
- **Description**: A personal library of saved meal ideas. Each idea has a name, prep effort level (low/medium/high), estimated duration in minutes, optional tags, and notes. Free tier users are capped at 10 saved ideas; Pro removes this limit.
- **Status**: Completed
- **Implementation notes**: MealIdea model with householdId, effort enum, durationMinutes, tags (array), notes. Free tier gate enforced at creation time via subscription check.
- **Date added**: 2026-05-05

---

## Meal Slots
- **Description**: Users can create meal slots for any day with a meal type of breakfast, lunch, dinner, or custom. Each slot shows which household members are home at that time based on schedule overlap. Slots have a status: unplanned, planned, leftovers, takeout, or skip. A slot can be assigned to a specific household member.
- **Status**: Completed
- **Implementation notes**: MealSlot model with date, type, status, assignedMemberId. "Who is home" computed by querying ScheduleBlocks for the slot's time window and finding members without a conflicting away block.
- **Date added**: 2026-05-05

---

## Smart Meal Suggestions
- **Description**: When planning a meal slot, the system suggests meals from the household's idea bank. Suggestions are ranked by a deterministic rule engine that considers available prep time before the next shift and how many people are home. No AI/ML — fast, predictable, and works offline.
- **Status**: Completed
- **Implementation notes**: Rule engine queries upcoming schedule blocks to compute free window duration. Filters MealIdeas by effort/duration that fit within the window. Ranks by number of home members (more people home = higher priority for larger meals).
- **Date added**: 2026-05-05

---

## Change Detection and Review Alerts
- **Description**: When a schedule block is modified or deleted, any meal slots affected by that change are automatically flagged with needsReview=true. The dashboard surfaces these alerts. Users can resolve each alert with one click: keep the meal as-is, switch to leftovers, switch to takeout, or reassign to another member.
- **Status**: Completed
- **Implementation notes**: needsReview boolean on MealSlot. Trigger runs on ScheduleBlock update/delete — finds overlapping MealSlots and sets flag. Resolution options write back to MealSlot status and clear the flag.
- **Date added**: 2026-05-05

---

## Tasks and Logistics
- **Description**: Lightweight task tracking scoped to the household. Tasks have a title, a due date, and an optional assignee (household member). Tasks can be marked complete or incomplete. Intended for grocery runs, errands, and other logistics tied to the meal plan.
- **Status**: Completed
- **Implementation notes**: Task model with householdId, title, dueDate, assignedMemberId, completedAt. List view sorted by date. Toggle endpoint flips completedAt.
- **Date added**: 2026-05-05

---

## Subscription Gating (Free vs Pro)
- **Description**: Two tiers. Free: 1 household member, max 10 meal ideas, 7-day planning horizon. Pro ($8.99/month or $69/year): unlimited members, unlimited meal ideas, unlimited planning horizon. Stripe handles checkout and the billing portal for plan management.
- **Status**: Completed
- **Implementation notes**: Subscription model tied to Household. Stripe checkout session created server-side. Billing portal URL generated on demand. Plan limits enforced at the API layer before writes.
- **Date added**: 2026-05-05

---

## Stripe Webhooks
- **Description**: Stripe events are received and processed to keep subscription status in sync. Handled events: checkout.session.completed (activate Pro), customer.subscription.updated (plan changes, renewal), customer.subscription.deleted (downgrade to free).
- **Status**: Completed
- **Implementation notes**: Webhook endpoint verifies Stripe signature. Upserts Subscription record on each relevant event. Downgrade path resets limits without deleting existing data above the free tier cap.
- **Date added**: 2026-05-05

---

## SEO Landing Pages
- **Description**: Static marketing pages targeting search traffic from shift workers and their families. Pages: homepage (/), /shift-worker-meal-planner, /meal-planning-night-shift-nurses, /family-planner-irregular-hours, /rotating-schedule-meal-prep. Each page is independently optimized for its keyword cluster.
- **Status**: Completed
- **Implementation notes**: Next.js static pages with per-page metadata exports. No dynamic data — fully cacheable. Internal linking connects the cluster pages back to the homepage CTA.
- **Date added**: 2026-05-05

---

## Mobile-First Responsive Design
- **Description**: The UI is designed for mobile as the primary surface. On mobile, navigation lives in a bottom tab bar. On desktop, a sidebar replaces it. Layout shifts are handled via Tailwind breakpoints — no separate mobile/desktop codebases.
- **Status**: Completed
- **Implementation notes**: Tailwind CSS with sm/md/lg breakpoints. Bottom nav component hidden on md+. Sidebar shown on md+. Touch targets sized for thumb use.
- **Date added**: 2026-05-05

---

## Dashboard
- **Description**: The central hub after sign-in. Shows: upcoming shifts for the current week, planned meals for the next few days, pending/incomplete tasks, and any meal slots flagged for review. Designed to give a shift worker a fast at-a-glance read of the week.
- **Status**: Completed
- **Implementation notes**: Dashboard aggregates data from ScheduleBlocks, MealSlots, and Tasks in a single server component fetch. Review alerts displayed with inline resolution buttons.
- **Date added**: 2026-05-05
