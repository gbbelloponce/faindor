import type { Dictionary } from "./types";

export const en: Dictionary = {
	metadata: {
		title: "Faindor",
		description:
			"Faindor is a free and open-source social media platform to share anything with people in your organization.",
	},
	common: {
		locales: {
			en: "English",
			es: "Spanish",
		},
	},
	auth: {
		login: {
			title: "Welcome Back",
			subtitle: "Log in to connect with your organization",
			loginButton: "Login",
			dontHaveAccount: "Don't have an account?",
			register: "Register here",
		},
		register: {
			title: "Register",
			subtitle: "Create an account to connect with your organization",
			registerButton: "Register",
			alreadyHaveAccount: "Already have an account?",
			login: "Login here",
		},
		common: {
			firstName: "First Name",
			lastName: "Last Name",
			email: "Email",
			password: "Password",
			confirmPassword: "Confirm Password",
		},
		logout: "Logout",
		messages: {
			loggedIn: "You have logged in successfully!",
			registered: "You have registered successfully!",
			loggedOut: "You have logged out",

			error: {
				logIn: {
					title: "Login failed",
					description: "There was an error logging in",
				},
				register: {
					title: "Registration failed",
					description: "There was an error registering",
				},
			},
		},
	},
	home: {
		title: "Home",
	},
};
