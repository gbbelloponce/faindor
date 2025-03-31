"use client";

import { Globe } from "lucide-react";

import { LocaleToFlag } from "@/components/locale-to-flag";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { i18n } from "@/dictionaries/i18n-config";
import { useLocale } from "@/hooks/useLocale";

export function LocaleSwitcher({
	buttonVariant = "outline",
}: { buttonVariant?: "outline" | "ghost" }) {
	const { dictionary, changeLocale } = useLocale();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant={buttonVariant} size="icon">
					<Globe />
					<span className="sr-only">Change language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{i18n.locales.map((locale) => (
					<DropdownMenuItem
						key={locale}
						onClick={() => changeLocale(locale)}
						className="cursor-pointer"
					>
						<LocaleToFlag locale={locale} />
						<span className="text-sm font-semibold">
							{dictionary.common.locales[locale]}
						</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
