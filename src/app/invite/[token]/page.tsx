import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AcceptInviteButton from "./AcceptInviteButton";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const session = await auth();

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invite not found</h1>
          <p className="text-gray-600 mb-6">This invite is invalid or has expired.</p>
          <Link href="/"><Button>Go home</Button></Link>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/invite/${token}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">You\&apos;re invited!</h1>
        <p className="text-gray-600 mb-6">
          Join <strong>{invite.household.name}</strong> on ShiftMeal.
        </p>
        <AcceptInviteButton token={token} />
      </div>
    </div>
  );
}
