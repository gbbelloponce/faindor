import { LogInErrorCodeEnum, RegisterErrorCodeEnum } from "@/auth/types";

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

			errors: {
				logIn: {
					[LogInErrorCodeEnum.NOT_FOUND]: {
						title: string;
						description: string;
					};
					[LogInErrorCodeEnum.UNAUTHORIZED]: {
						title: string;
						description: string;
					};
					[LogInErrorCodeEnum.INTERNAL_SERVER_ERROR]: {
						title: string;
						description: string;
					};
				};
				register: {
					[RegisterErrorCodeEnum.INTERNAL_SERVER_ERROR]: {
						title: string;
						description: string;
					};
				};
			};
		};
	};
	home: {
		title: string;
	};
};
