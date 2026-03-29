"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/dictionaries/useLocale";

export default function NotFound() {
	const { dictionary, locale } = useLocale();
	const d = dictionary.common;

	return (
		<div className="flex min-h-svh items-center justify-center p-4">
			<div className="flex flex-col items-center gap-4 text-center">
				<span className="text-7xl font-bold text-muted-foreground/30">404</span>
				<h1 className="text-xl font-semibold">{d.notFound.title}</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{d.notFound.subtitle}
				</p>
				<Button asChild>
					<Link href={`/${locale}/home`}>{d.goHome}</Link>
				</Button>
			</div>
		</div>
	);
}
