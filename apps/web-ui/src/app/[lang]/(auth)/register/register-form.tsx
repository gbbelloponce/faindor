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
import { useLocale } from "@/hooks/useLocale";
import { useAuthStore } from "@/lib/store/auth-store";

const formSchema = z
	.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters long"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function RegisterForm() {
	const router = useRouter();

	const { dictionary } = useLocale();

	const { register, isLoading, error } = useAuthStore();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		const success = await register(
			data.firstName,
			data.lastName,
			data.email,
			data.password,
		);

		if (success) {
			toast.success(dictionary.auth.messages.registered);
			router.push("/home");
		} else {
			toast.error(
				error?.title ?? dictionary.auth.messages.error.register.title,
				{
					description:
						error?.description ??
						dictionary.auth.messages.error.register.description,
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
				<div className="flex flex-row items-start gap-2">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormLabel>{dictionary.auth.common.firstName}</FormLabel>
								<FormControl>
									<Input {...field} disabled={isLoading} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem className="flex-1">
								<FormLabel>{dictionary.auth.common.lastName}</FormLabel>
								<FormControl>
									<Input {...field} disabled={isLoading} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
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
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{dictionary.auth.common.confirmPassword}</FormLabel>
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
						dictionary.auth.register.registerButton
					)}
				</Button>
			</form>
		</Form>
	);
}
