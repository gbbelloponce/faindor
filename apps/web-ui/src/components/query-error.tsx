"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/dictionaries/useLocale";

interface QueryErrorProps {
	message?: string;
	onRetry?: () => void;
}

export function QueryError({ message, onRetry }: QueryErrorProps) {
	const { dictionary } = useLocale();
	const d = dictionary.common;

	return (
		<div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
			<AlertCircle className="size-8 text-destructive" />
			<p className="text-sm text-muted-foreground">
				{message ?? d.error.subtitle}
			</p>
			{onRetry && (
				<Button variant="outline" size="sm" onClick={onRetry}>
					{d.tryAgain}
				</Button>
			)}
		</div>
	);
}
