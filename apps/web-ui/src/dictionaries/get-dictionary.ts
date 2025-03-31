import { en } from "./en";
import { es } from "./es";
import type { Locale } from "./i18n-config";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = {
	en,
	es,
};

export const getDictionary = (locale: Locale) => {
	return dictionaries[locale] ?? dictionaries.en;
};
