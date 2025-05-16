export interface User {
	id: number;
	name: string;
	role: string;
	email: string;
}

export interface AuthState {
	isLoading: boolean;
	currentUser: User | null;
	setIsLoading: (isLoading: boolean) => void;
	setCurrentUser: (user: User | null) => void;
}

export type AuthResponse<ErrorCodeType> =
	| { success: true; error: null }
	| { success: false; error: { code: ErrorCodeType } };

export enum LogInErrorCodeEnum {
	NOT_FOUND = "NOT_FOUND",
	UNAUTHORIZED = "UNAUTHORIZED",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export enum RegisterErrorCodeEnum {
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
