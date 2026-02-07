"use client";

import { Button } from "@/components/ui/button";

// biome-ignore lint/suspicious/noShadowRestrictedNames: Next.js App Router convention
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex h-full w-full flex-1 items-center justify-center">
			<div className="flex flex-col items-center gap-4 text-center">
				<h2 className="text-xl font-semibold">Something went wrong</h2>
				<p className="text-muted-foreground text-sm">
					{error.message || "An unexpected error occurred."}
				</p>
				<Button onClick={reset}>Try Again</Button>
			</div>
		</div>
	);
}
