import Link from "next/link";

import { Logo } from "@/components/logo";
import { getDictionary } from "@/dictionaries/get-dictionary";
import type { Locale } from "@/dictionaries/i18n-config";
import { RegisterForm } from "./register-form";

export default async function Register({
	params,
}: { params: { lang: Locale } }) {
	const { lang } = await params;

	const dictionary = getDictionary(lang);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center">
			<div className="w-full max-w-md space-y-8">
				<div className="flex flex-col items-center space-y-2 text-center">
					<Logo size="md" withTitle />
					<h1 className="text-4xl font-bold">
						{dictionary.auth.register.title}
					</h1>
					<p className="text-muted-foreground">
						{dictionary.auth.register.subtitle}
					</p>
				</div>
				<RegisterForm />
				<div className="text-center text-sm">
					{dictionary.auth.register.alreadyHaveAccount}{" "}
					<Link href="/login" className="font-medium text-primary underline">
						{dictionary.auth.register.login}
					</Link>
				</div>
			</div>
		</div>
	);
}
