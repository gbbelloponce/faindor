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
		message: string;
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
	messages: {
		title: string;
		noConversations: string;
		noConversationsHint: string;
		selectConversation: string;
		messagePlaceholder: string;
		you: string;
		unreadBadgeLabel: string;
	};
	emailVerification: {
		title: string;
		subtitle: string;
		resend: string;
		resendSuccess: string;
		verifying: string;
		verifiedTitle: string;
		verifiedSubtitle: string;
		errorTitle: string;
		errorSubtitle: string;
		backToLogin: string;
		goToApp: string;
	};
	events: {
		title: string;
		createEvent: string;
		noEvents: string;
		going: string;
		notGoing: string;
		rsvp: string;
		location: string;
		onlineEvent: string;
		startsAt: string;
		endsAt: string;
		titleLabel: string;
		description: string;
		cancel: string;
		createSuccess: string;
		createError: string;
		rsvpSuccess: string;
	};
	admin: {
		title: string;
		tabs: {
			users: string;
			orgSettings: string;
			events: string;
			content: string;
		};
		users: {
			name: string;
			email: string;
			role: string;
			status: string;
			joined: string;
			active: string;
			suspended: string;
			deleted: string;
			suspend: string;
			activate: string;
			delete: string;
			promoteToAdmin: string;
			revokeAdmin: string;
			noUsers: string;
			confirmSuspend: string;
			confirmDelete: string;
			actionSuccess: string;
			actionError: string;
		};
		orgSettings: {
			name: string;
			description: string;
			namePlaceholder: string;
			descriptionPlaceholder: string;
			save: string;
			updateSuccess: string;
			updateError: string;
		};
		content: {
			deletePost: string;
			confirmDeletePost: string;
			deleteSuccess: string;
			deleteError: string;
			noPosts: string;
		};
	};
};
