import Link from "next/link";
import { ChefHat, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

type AccessRequiredStateProps = {
  title: string;
  description: string;
};

export default function AccessRequiredState({
  title,
  description,
}: AccessRequiredStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-gray-900">
          <ChefHat className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">ShiftMeal</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-sm text-gray-600">{description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/auth/signin">
            <Button className="w-full sm:w-auto">Sign in</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
