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
		createPost: {
			placeholder: string;
			button: string;
			attachImage: string;
			removeImage: string;
			imageTooBig: string;
			imageInvalidType: string;
		};
		post: {
			likes: string;
			comments: string;
			commentPlaceholder: string;
			noComments: string;
		};
		emptyFeed: string;
	};
	groups: {
		title: string;
		createGroup: string;
		cancel: string;
		groupNamePlaceholder: string;
		noGroups: string;
		members: string;
		posts: string;
		join: string;
		leave: string;
		backToGroups: string;
		emptyFeed: string;
	};
	profile: {
		posts: string;
		noPosts: string;
		editProfile: string;
		saveChanges: string;
		cancel: string;
		bio: string;
		namePlaceholder: string;
		bioPlaceholder: string;
		avatarLabel: string;
		updateSuccess: string;
		updateError: string;
	};
	notifications: {
		title: string;
		empty: string;
		likedYourPost: string;
		commentedOnYourPost: string;
		repliedToYourComment: string;
	};
	search: {
		placeholder: string;
		users: string;
		posts: string;
		noResults: string;
	};
};
