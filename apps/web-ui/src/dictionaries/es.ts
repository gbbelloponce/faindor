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
			title: "Reconéctate con tu equipo",
			subtitle: "Mantente al día. Inicia sesión en tu espacio de trabajo.",
			loginButton: "Iniciar sesión",
			dontHaveAccount: "¿No tienes una cuenta?",
			register: "Registrate aquí",
		},
		register: {
			title: "Únete a la red de tu equipo",
			subtitle: "Crea una cuenta para conectarte con tus compañeros.",
			registerButton: "Crear cuenta",
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
