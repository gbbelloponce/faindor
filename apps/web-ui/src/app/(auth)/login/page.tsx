import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggler } from "@/components/theme-toggler";
import { LoginForm } from "./login-form";

export default function Login() {
	return (
		<>
			<header className="absolute top-2 right-2">
				<ThemeToggler buttonVariant="ghost" />
			</header>
			<div className="min-h-screen flex flex-col items-center justify-center">
				<div className="w-full max-w-md space-y-8">
					<div className="flex flex-col items-center space-y-2 text-center">
						<Logo size="md" withTitle />
						<h1 className="text-4xl font-bold">Welcome back</h1>
						<p className="text-muted-foreground">
							Log in to connect with your organization
						</p>
					</div>
					<LoginForm />
					<div className="text-center text-sm">
						Don't have an account?{" "}
						<Link
							href="/register"
							className="font-medium text-primary underline"
						>
							Register here
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
