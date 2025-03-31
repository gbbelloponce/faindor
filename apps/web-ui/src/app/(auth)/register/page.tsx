import Link from "next/link";

import { Logo } from "@/components/logo";
import { RegisterForm } from "./register-form";

export default function Register() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<div className="w-full max-w-md space-y-8">
				<div className="flex flex-col items-center space-y-2 text-center">
					<Logo size="md" withTitle />
					<h1 className="text-4xl font-bold">Create an account</h1>
					<p className="text-muted-foreground">
						Join your organization's network
					</p>
				</div>
				<RegisterForm />
				<div className="text-center text-sm">
					Already have an account?{" "}
					<Link href="/login" className="font-medium text-primary underline">
						Log In
					</Link>
				</div>
			</div>
		</div>
	);
}
