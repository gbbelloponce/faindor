export type Dictionary = {
	metadata: {
		title: string;
		description: string;
	};
	common: {
		locales: {
			en: string;
			es: string;
		};
	};
	home: {
		title: string;
	};
	auth: {
		login: {
			title: string;
			subtitle: string;
		};
		register: {
			title: string;
			subtitle: string;
		};
	};
};
