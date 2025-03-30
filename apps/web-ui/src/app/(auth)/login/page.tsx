"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

export default function Login() {
	const { isLoading, logInWithCredentials } = useAuthStore();

	const router = useRouter();

	if (isLoading) {
		return <div>Logging In...</div>;
	}

	return (
		<div>
			<Button
				className="cursor-pointer"
				onClick={async () => {
					const success = await logInWithCredentials(
						"john@doe.com",
						"johndoe123**",
					);

					if (success) {
						toast.success("You were logged in successfully!");
						router.push("/home");
					}
				}}
			>
				Login
			</Button>
		</div>
	);
}
