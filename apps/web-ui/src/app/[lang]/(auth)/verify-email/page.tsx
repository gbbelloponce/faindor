"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2, MailOpen, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";

function VerifyEmailContent() {
	const { dictionary, locale } = useLocale();
	const d = dictionary.emailVerification;
	const trpc = useTRPC();
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [verifyState, setVerifyState] = useState<
		"idle" | "verifying" | "success" | "error"
	>(token ? "verifying" : "idle");

	const verifyMutation = useMutation(
		trpc.auth.verifyEmail.mutationOptions({
			onSuccess: () => {
				setVerifyState("success");
				setTimeout(() => router.replace(`/${locale}/home`), 2000);
			},
			onError: () => {
				setVerifyState("error");
			},
		}),
	);

	const resendMutation = useMutation(
		trpc.auth.sendVerificationEmail.mutationOptions({
			onSuccess: () => toast.success(d.resendSuccess),
			onError: (e) => toast.error(e.message),
		}),
	);

	const hasVerified = useRef(false);
	// biome-ignore lint/correctness/useExhaustiveDependencies: verifyMutation.mutate is stable and we only want this to fire once on mount when token is present
	useEffect(() => {
		if (token && !hasVerified.current) {
			hasVerified.current = true;
			verifyMutation.mutate({ token });
		}
	}, [token]);

	if (verifyState === "verifying") {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4">
				<Loader2 className="size-10 animate-spin text-muted-foreground" />
				<p className="text-muted-foreground">{d.verifying}</p>
			</div>
		);
	}

	if (verifyState === "success") {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
				<CheckCircle className="size-12 text-green-500" />
				<h1 className="text-2xl font-bold">{d.verifiedTitle}</h1>
				<p className="text-muted-foreground">{d.verifiedSubtitle}</p>
			</div>
		);
	}

	if (verifyState === "error") {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 max-w-sm mx-auto">
				<XCircle className="size-12 text-destructive" />
				<h1 className="text-2xl font-bold">{d.errorTitle}</h1>
				<p className="text-muted-foreground">{d.errorSubtitle}</p>
				<Button
					onClick={() => resendMutation.mutate()}
					disabled={resendMutation.isPending}
				>
					{resendMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : null}
					{d.resend}
				</Button>
				<Link
					href={`/${locale}/login`}
					className="text-sm text-muted-foreground underline"
				>
					{d.backToLogin}
				</Link>
			</div>
		);
	}

	// idle — "check your inbox" state
	return (
		<div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 max-w-sm mx-auto">
			<MailOpen className="size-12 text-muted-foreground" />
			<h1 className="text-2xl font-bold">{d.title}</h1>
			<p className="text-muted-foreground">{d.subtitle}</p>
			<Button
				variant="outline"
				onClick={() => resendMutation.mutate()}
				disabled={resendMutation.isPending}
			>
				{resendMutation.isPending ? (
					<Loader2 className="size-4 animate-spin" />
				) : null}
				{d.resend}
			</Button>
			<Link
				href={`/${locale}/login`}
				className="text-sm text-muted-foreground underline"
			>
				{d.backToLogin}
			</Link>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center">
					<Loader2 className="size-8 animate-spin text-muted-foreground" />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
