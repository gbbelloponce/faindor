import { Resend } from "resend";

export const sendVerificationEmail = async ({
	to,
	verificationUrl,
}: {
	to: string;
	verificationUrl: string;
}) => {
	if (!process.env.RESEND_API_KEY) {
		console.warn(
			"[email] RESEND_API_KEY not set — skipping verification email",
		);
		return;
	}

	const resend = new Resend(process.env.RESEND_API_KEY);
	const from =
		process.env.RESEND_FROM_EMAIL ?? "Faindor <onboarding@resend.dev>";

	await resend.emails.send({
		from,
		to,
		subject: "Verify your Faindor account",
		html: `
			<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
				<h2 style="margin-bottom: 8px;">Welcome to Faindor!</h2>
				<p style="color: #555;">Please verify your email address to get started.</p>
				<a
					href="${verificationUrl}"
					style="display: inline-block; margin: 24px 0; padding: 12px 24px; background: #18181b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;"
				>
					Verify email
				</a>
				<p style="color: #888; font-size: 14px;">This link expires in 24 hours. If you didn't create a Faindor account, you can safely ignore this email.</p>
			</div>
		`,
	});
};
