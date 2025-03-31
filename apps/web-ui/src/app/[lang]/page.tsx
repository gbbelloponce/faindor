import { redirect } from "next/navigation";

import type { Locale } from "@/dictionaries/i18n-config";

export default async function Root({ params }: { params: { lang: Locale } }) {
	const { lang } = await params;
	redirect(`/${lang}/home`);
}
