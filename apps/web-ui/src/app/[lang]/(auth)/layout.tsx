import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggler } from "@/components/theme-toggler";

export default function AuthLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<>
			<header className="absolute top-2 right-2">
				<LocaleSwitcher buttonVariant="ghost" />
				<ThemeToggler buttonVariant="ghost" />
			</header>
			{children}
		</>
	);
}
