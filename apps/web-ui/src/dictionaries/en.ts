import { LogInErrorCodeEnum, RegisterErrorCodeEnum } from "@/auth/types";
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
			title: "Reconnect with your team",
			subtitle: "Stay in the loop. Log in to your workspace.",
			loginButton: "Log In",
			dontHaveAccount: "Don't have an account?",
			register: "Register here",
		},
		register: {
			title: "Join Your Team's Network",
			subtitle: "Create an account to connect with your colleagues.",
			registerButton: "Create Account",
			alreadyHaveAccount: "Already have an account?",
			login: "Log In here",
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

			errors: {
				logIn: {
					[LogInErrorCodeEnum.NOT_FOUND]: {
						title: "User not found",
						description: "There is no existing user with the email given.",
					},
					[LogInErrorCodeEnum.UNAUTHORIZED]: {
						title: "Invalid credentials",
						description: "The credentials provided are not correct.",
					},
					[LogInErrorCodeEnum.INTERNAL_SERVER_ERROR]: {
						title: "Login failed",
						description: "There was an internal server error while logging in.",
					},
				},
				register: {
					[RegisterErrorCodeEnum.INTERNAL_SERVER_ERROR]: {
						title: "Register failed",
						description:
							"There was an internal server error while registering.",
					},
				},
			},
		},
	},
	home: {
		title: "Home",
	},
};
