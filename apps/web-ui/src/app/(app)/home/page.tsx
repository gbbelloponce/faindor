"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { ThemeToggler } from "@/components/theme-toggler";

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
					toast.success("You were logged out");
					router.push("/login");
				}}
			>
				Log Out
			</Button>
			<ThemeToggler />
		</>
	);
}
