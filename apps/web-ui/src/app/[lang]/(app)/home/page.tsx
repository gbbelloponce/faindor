"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/auth-store";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggler } from "@/components/theme-toggler";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/dictionaries/useLocale";

export default function Home() {
	const { logOut } = useAuthStore();
	const { dictionary } = useLocale();
	const router = useRouter();

	return (
		<>
			<div>{dictionary.home.title}</div>
			<Button
				className="cursor-pointer"
				onClick={async () => {
					logOut();
					toast.success(dictionary.auth.messages.loggedOut);
					router.push("/login");
				}}
			>
				{dictionary.auth.logout}
			</Button>
			<ThemeToggler />
			<LocaleSwitcher />
		</>
	);
}
