"use client";

import Link from "next/link";

import { Logo } from "@/components/logo";
import { useLocale } from "@/dictionaries/useLocale";
import { LoginForm } from "./login-form";

export default function Login() {
	const { dictionary } = useLocale();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<div className="w-full max-w-md space-y-8">
				<div className="flex flex-col items-center space-y-2 text-center">
					<Logo size="md" withTitle />
					<h1 className="text-4xl font-bold">{dictionary.auth.login.title}</h1>
					<p className="text-muted-foreground">
						{dictionary.auth.login.subtitle}
					</p>
				</div>
				<LoginForm />
				<div className="text-center text-sm">
					{dictionary.auth.login.dontHaveAccount}{" "}
					<Link href="/register" className="font-medium text-primary underline">
						{dictionary.auth.login.register}
					</Link>
				</div>
			</div>
		</div>
	);
}
