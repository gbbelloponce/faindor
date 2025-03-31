import type { Dictionary } from "./types";

export const es: Dictionary = {
	metadata: {
		title: "Faindor",
		description:
			"Faindor es una plataforma social gratuita y de código abierto para compartir cualquier cosa con las personas en tu organización.",
	},
	common: {
		locales: {
			en: "Inglés",
			es: "Español",
		},
	},
	auth: {
		login: {
			title: "Bienvenido de Nuevo",
			subtitle: "Inicia sesión para conectarte con tu organización",
			loginButton: "Iniciar sesión",
			dontHaveAccount: "¿No tienes una cuenta?",
			register: "Registrate aquí",
		},
		register: {
			title: "Registrarse",
			subtitle: "Crea una cuenta para conectarte con tu organización",
			registerButton: "Registrarse",
			alreadyHaveAccount: "¿Ya tienes una cuenta?",
			login: "Inicia sesión aquí",
		},
		common: {
			firstName: "Nombre",
			lastName: "Apellido",
			email: "Correo electrónico",
			password: "Contraseña",
			confirmPassword: "Confirmar contraseña",
		},
		logout: "Cerrar Sesión",
		messages: {
			loggedIn: "Has iniciado sesión exitosamente!",
			registered: "Has registrado una cuenta exitosamente!",
			loggedOut: "Has cerrado sesión",
			error: {
				logIn: {
					title: "Error al iniciar sesión",
					description: "Hubo un error al iniciar sesión",
				},
				register: {
					title: "Error al registrar una cuenta",
					description: "Hubo un error al registrar una cuenta",
				},
			},
		},
	},
	home: {
		title: "Inicio",
	},
};
