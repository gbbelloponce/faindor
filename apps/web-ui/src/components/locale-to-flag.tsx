import type { Locale } from "@/dictionaries/i18n-config";
import { SpainFlag } from "./flags/spain-flag";
import { USFlag } from "./flags/us-flag";

export function LocaleToFlag({ locale }: { locale: Locale }) {
	if (locale === "en") {
		return <USFlag className="w-7 h-5" />;
	}

	if (locale === "es") {
		return <SpainFlag className="w-6 h-4" />;
	}

	return null;
}
