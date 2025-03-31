"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";

const formSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

export function LoginForm() {
	const router = useRouter();

	const { logInWithCredentials, isLoading, error } = useAuthStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const success = await logInWithCredentials(data.email, data.password);

		if (success) {
			toast.success("Logged in successfully!");
			router.push("/home");
		} else {
			toast.error(error?.title ?? "Login failed", {
				description: error?.description ?? "There was an error logging in",
			});
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4 min-w-xs"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input {...field} disabled={isLoading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input {...field} type="password" disabled={isLoading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
				</Button>
			</form>
		</Form>
	);
}
