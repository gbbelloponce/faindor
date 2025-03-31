import Image from "next/image";

import { cn } from "@/lib/utils";

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const logoSizeToPixel: Record<LogoSize, number> = {
	xs: 24,
	sm: 32,
	md: 40,
	lg: 48,
	xl: 56,
};

export function Logo({
	size,
	withTitle,
	titleClassname,
}: {
	size: LogoSize;
	withTitle?: boolean;
	titleClassname?: string;
}) {
	const pixels = logoSizeToPixel[size];

	return (
		<div className="flex items-center space-x-2">
			<div className="rounded-full bg-primary">
				<Image
					src="/faindor-logo-rounded.png"
					alt="Faindor"
					width={pixels}
					height={pixels}
				/>
			</div>
			{withTitle && (
				<span className={cn("text-2xl font-bold", titleClassname)}>
					Faindor
				</span>
			)}
		</div>
	);
}
