import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    maxMembers: 1,
    maxMealIdeas: 10,
    planningDays: 7,
  },
  pro: {
    name: "Pro Household",
    maxMembers: 5,
    maxMealIdeas: Infinity,
    planningDays: 30,
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "",
    yearlyPriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? "",
  },
};
