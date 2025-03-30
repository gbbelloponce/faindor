"use client";

import { useRouter } from "next/navigation";

import { ThemeToggler } from "@/components/theme-toggler";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

export default function Home() {
	const { logOut } = useAuthStore();
	const router = useRouter();

	return (
		<>
			<div>Home</div>
			<Button
				className="cursor-pointer"
				onClick={async () => {
					logOut();
					router.push("/login");
				}}
			>
				Log Out
			</Button>
			<ThemeToggler />
		</>
	);
}
