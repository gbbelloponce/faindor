import { getDomainWithoutSuffix, getDomain } from "tldts";

export const COMMON_EMAIL_PROVIDERS = new Set([
	"gmail",
	"outlook",
	"hotmail",
	"live",
	"msn",
	"yahoo",
	"icloud",
	"me",
	"mac",
	"aol",
	"protonmail",
	"gmx",
	"zoho",
	"fastmail",
	"qq",
	"163",
	"126",
	"yeah",
	"sina",
	"sohu",
	"tom",
	"mail",
	"bk",
	"list",
	"inbox",
	"yandex",
	"ya",
	"web",
	"t-online",
	"freenet",
	"orange",
	"laposte",
	"libero",
	"virgilio",
	"tin",
	"seznam",
	"wp",
	"o2",
	"interia",
	"terra",
	"uol",
	"bol",
	"telefonica",
	"movistar",
]);

export const isCommonProvider = (domain: string) =>
	COMMON_EMAIL_PROVIDERS.has(domain);

export const getNormalizedDomainFromEmail = (email: string) => {
	const fullDomain = email.split("@")[1]; // eg 'engineering.uber.com'
	const parsedDomain = getDomain(fullDomain); // eg 'uber.com'
	const domainWithoutSuffix = getDomainWithoutSuffix(fullDomain); // 'uber'

	// If the domain is invalid, return full domain
	if (!parsedDomain || !domainWithoutSuffix) return fullDomain;

	// If the domain is from a common provider, group all users inside the same organization without taking care of the suffix
	if (isCommonProvider(domainWithoutSuffix)) return domainWithoutSuffix;

	// Use parsed domain for corporative emails
	return parsedDomain;
};
