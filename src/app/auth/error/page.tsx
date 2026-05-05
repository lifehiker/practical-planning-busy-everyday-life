import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">Something went wrong during sign-in. Please try again.</p>
        <Link href="/auth/signin">
          <Button>Try again</Button>
        </Link>
      </div>
    </div>
  );
}
