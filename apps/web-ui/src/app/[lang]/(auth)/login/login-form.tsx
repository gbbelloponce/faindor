"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
	FROM_LOGIN_COOKIE_CONFIG,
	FROM_LOGIN_COOKIE_KEY,
} from "@/auth/constants";
import { useAuth } from "@/auth/useAuth";
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
import { useLocale } from "@/dictionaries/useLocale";

const formSchema = z.object({
	email: z.string().email({ error: "Invalid email address" }),
	password: z
		.string()
		.min(8, { error: "Password must be at least 8 characters long" }),
});

export function LoginForm() {
	const router = useRouter();

	const { dictionary } = useLocale();

	const { logInWithCredentials, isLoading } = useAuth();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const response = await logInWithCredentials(data.email, data.password);

		if (response.success) {
			toast.success(dictionary.auth.messages.loggedIn);
			Cookies.set(FROM_LOGIN_COOKIE_KEY, "1", FROM_LOGIN_COOKIE_CONFIG);
			router.push("/home");
		} else {
			toast.error(
				dictionary.auth.messages.errors.logIn[response.error.code].title,
				{
					description:
						dictionary.auth.messages.errors.logIn[response.error.code]
							.description,
				},
			);
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
							<FormLabel>{dictionary.auth.common.email}</FormLabel>
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
							<FormLabel>{dictionary.auth.common.password}</FormLabel>
							<FormControl>
								<Input {...field} type="password" disabled={isLoading} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="animate-spin" />
					) : (
						dictionary.auth.login.loginButton
					)}
				</Button>
			</form>
		</Form>
	);
}
