import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/globals.css";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { type Locale, i18n } from "@/dictionaries/i18n-config";
import { AppTRPCProvider } from "@/trpc/app-trpc-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata({
	params,
}: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
	const { lang } = await params;

	const dictionary = getDictionary(lang);

	return {
		title: dictionary.metadata.title,
		description: dictionary.metadata.description,
		icons: ["/faindor-logo-rounded.png"],
	};
}

export async function generateStaticParams() {
	return i18n.locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ lang: Locale }>;
}>) {
	const { lang } = await params;

	return (
		<html lang={lang} suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<AppTRPCProvider>
						{children}
						<Toaster />
					</AppTRPCProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
