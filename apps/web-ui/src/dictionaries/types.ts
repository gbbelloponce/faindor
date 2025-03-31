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
	auth: {
		login: {
			title: string;
			subtitle: string;
			loginButton: string;
			dontHaveAccount: string;
			register: string;
		};
		register: {
			title: string;
			subtitle: string;
			registerButton: string;
			alreadyHaveAccount: string;
			login: string;
		};
		common: {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			confirmPassword: string;
		};
		logout: string;
		messages: {
			loggedIn: string;
			registered: string;
			loggedOut: string;
			error: {
				logIn: {
					title: string;
					description: string;
				};
				register: {
					title: string;
					description: string;
				};
			};
		};
	};
	home: {
		title: string;
	};
};
