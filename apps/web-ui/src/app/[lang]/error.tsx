"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/dictionaries/useLocale";

// Catches unhandled errors in [lang] routes that don't have a more specific
// error.tsx (e.g. auth pages). The (app) group has its own error.tsx which
// takes precedence for protected routes.

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js App Router convention
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const { dictionary, locale } = useLocale();
	const d = dictionary.common;

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<div className="flex flex-col items-center gap-4 text-center">
				<h2 className="text-xl font-semibold">{d.error.title}</h2>
				<p className="max-w-sm text-sm text-muted-foreground">
					{error.message || d.error.subtitle}
				</p>
				<div className="flex gap-2">
					<Button onClick={reset}>{d.tryAgain}</Button>
					<Button variant="outline" asChild>
						<Link href={`/${locale}/home`}>{d.goHome}</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
