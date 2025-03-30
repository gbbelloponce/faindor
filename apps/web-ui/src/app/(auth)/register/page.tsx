"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

export default function Register() {
	const { isLoading, register } = useAuthStore();
	const router = useRouter();

	if (isLoading) {
		return <div>Registering...</div>;
	}

	return (
		<div>
			<Button
				className="cursor-pointer"
				onClick={async () => {
					const success = await register(
						"John",
						"Doe",
						"john@doe.com",
						"johndoe123**",
					);
					if (success) {
						toast.success("You were registered successfully!");
						router.push("/home");
					}
				}}
			>
				Register
			</Button>
		</div>
	);
}
