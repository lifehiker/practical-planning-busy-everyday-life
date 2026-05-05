import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

export async function sendInviteEmail({
  to,
  householdName,
  inviterName,
  token,
}: {
  to: string;
  householdName: string;
  inviterName: string;
  token: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${token}`;

  try {
    await resend.emails.send({
      from: "ShiftMeal <noreply@shiftmeal.app>",
      to,
      subject: `You've been invited to join ${householdName} on ShiftMeal`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited to join ${householdName}!</h2>
          <p>${inviterName} has invited you to join their household on ShiftMeal â the meal planner built for irregular schedules.</p>
          <p>
            <a href="${inviteUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This invite expires in 7 days. If you did not expect this invitation, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send invite email:", error);
  }
}
