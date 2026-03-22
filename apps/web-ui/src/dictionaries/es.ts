import { LogInErrorCodeEnum, RegisterErrorCodeEnum } from "@/auth/types";
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

			errors: {
				logIn: {
					[LogInErrorCodeEnum.NOT_FOUND]: {
						title: "Usuario no encontrado",
						description:
							"No se ha encontrado un usuario con el email proporcionado.",
					},
					[LogInErrorCodeEnum.UNAUTHORIZED]: {
						title: "Credenciales inválidas",
						description: "Las credenciales proporcionadas no son correctas.",
					},
					[LogInErrorCodeEnum.INTERNAL_SERVER_ERROR]: {
						title: "Error al iniciar sesión",
						description:
							"Ha ocurrido un error interno en el servidor al iniciar sesión.",
					},
				},
				register: {
					[RegisterErrorCodeEnum.INTERNAL_SERVER_ERROR]: {
						title: "Error al registrar",
						description:
							"Ha ocurrido un error interno en el servidor al registrar.",
					},
				},
			},
		},
	},
	home: {
		title: "Inicio",
		createPost: {
			placeholder: "¿Qué tienes en mente?",
			button: "Publicar",
			attachImage: "Adjuntar imagen",
			removeImage: "Eliminar imagen",
			imageTooBig: "La imagen debe pesar menos de 5 MB.",
			imageInvalidType: "Solo se aceptan imágenes JPEG, PNG, WebP o GIF.",
		},
		post: {
			likes: "me gusta",
			comments: "comentarios",
			commentPlaceholder: "Escribe un comentario…",
			noComments: "Sin comentarios aún. ¡Sé el primero!",
		},
		emptyFeed: "No hay publicaciones aún. ¡Sé el primero en compartir algo!",
	},
	groups: {
		title: "Grupos",
		createGroup: "Crear grupo",
		cancel: "Cancelar",
		groupNamePlaceholder: "Nombre del grupo…",
		noGroups: "Aún no hay grupos. ¡Crea el primero!",
		members: "miembros",
		posts: "publicaciones",
		join: "Unirse",
		leave: "Salir",
		backToGroups: "← Volver a grupos",
		emptyFeed: "Aún no hay publicaciones en este grupo. ¡Sé el primero!",
	},
	profile: {
		posts: "Publicaciones",
		noPosts: "Aún no hay publicaciones.",
		editProfile: "Editar perfil",
		saveChanges: "Guardar cambios",
		cancel: "Cancelar",
		bio: "Biografía",
		namePlaceholder: "Tu nombre",
		bioPlaceholder: "Cuéntanos sobre ti…",
		avatarLabel: "Foto de perfil",
		updateSuccess: "Perfil actualizado",
		updateError: "Error al actualizar perfil",
	},
	notifications: {
		title: "Notificaciones",
		empty: "Aún no hay notificaciones.",
		likedYourPost: "le dio me gusta a tu publicación",
		commentedOnYourPost: "comentó en tu publicación",
		repliedToYourComment: "respondió a tu comentario",
	},
	search: {
		placeholder: "Buscar…",
		users: "Usuarios",
		posts: "Publicaciones",
		noResults: "Sin resultados.",
	},
	emailVerification: {
		title: "Revisa tu correo",
		subtitle:
			"Te enviamos un correo de verificación. Haz clic en el enlace del correo para activar tu cuenta.",
		resend: "Reenviar correo",
		resendSuccess: "Correo de verificación enviado",
		verifying: "Verificando…",
		verifiedTitle: "¡Correo verificado!",
		verifiedSubtitle: "Tu cuenta está lista. Te llevamos a la app…",
		errorTitle: "Error de verificación",
		errorSubtitle:
			"El enlace puede haber expirado o ya fue usado. Solicita uno nuevo.",
		backToLogin: "Volver al inicio de sesión",
		goToApp: "Ir a la app",
	},
	events: {
		title: "Eventos",
		createEvent: "Crear evento",
		noEvents: "Sin eventos próximos.",
		going: "Asistiré",
		notGoing: "No asistiré",
		rsvp: "RSVP",
		location: "Lugar",
		onlineEvent: "En línea",
		startsAt: "Inicia",
		endsAt: "Termina",
		titleLabel: "Título",
		description: "Descripción",
		cancel: "Cancelar",
		createSuccess: "Evento creado",
		createError: "Error al crear el evento",
		rsvpSuccess: "RSVP actualizado",
	},
	admin: {
		title: "Admin",
		tabs: {
			users: "Usuarios",
			orgSettings: "Organización",
			events: "Eventos",
			content: "Contenido",
		},
		users: {
			name: "Nombre",
			email: "Correo electrónico",
			role: "Rol",
			status: "Estado",
			joined: "Se unió",
			active: "Activo",
			suspended: "Suspendido",
			deleted: "Eliminado",
			suspend: "Suspender",
			activate: "Activar",
			delete: "Eliminar",
			promoteToAdmin: "Promover a admin",
			revokeAdmin: "Revocar admin",
			noUsers: "Sin usuarios.",
			confirmSuspend: "¿Suspender este usuario?",
			confirmDelete: "¿Eliminar este usuario? Esto no se puede deshacer.",
			actionSuccess: "Acción completada",
			actionError: "Error al ejecutar acción",
		},
		orgSettings: {
			name: "Nombre de la organización",
			description: "Descripción",
			namePlaceholder: "Nombre de la organización…",
			descriptionPlaceholder: "Describe tu organización…",
			save: "Guardar cambios",
			updateSuccess: "Organización actualizada",
			updateError: "Error al actualizar la organización",
		},
		content: {
			deletePost: "Eliminar",
			confirmDeletePost: "¿Eliminar esta publicación?",
			deleteSuccess: "Publicación eliminada",
			deleteError: "Error al eliminar la publicación",
			noPosts: "Sin publicaciones.",
		},
	},
};
