export interface User {
	id: number;
	name: string;
	role: string;
	email: string;
}
export interface Organization {
	id: number;
	name: string;
}

export interface UserWithOrganization extends User {
	organization: Organization;
}

export interface AuthState {
	isLoading: boolean;
	currentUser: UserWithOrganization | null;
	isRefreshing: boolean;
	setIsLoading: (isLoading: boolean) => void;
	setCurrentUser: (user: UserWithOrganization | null) => void;
	setIsRefreshing: (isRefreshing: boolean) => void;
}

export type AuthResponse<ErrorCodeType> =
	| { success: true; error: null }
	| { success: false; error: { code: ErrorCodeType } };

export enum LogInErrorCodeEnum {
	NOT_FOUND = "NOT_FOUND",
	UNAUTHORIZED = "UNAUTHORIZED",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export enum RefreshTokenErrorCodeEnum {
	UNAUTHORIZED = "UNAUTHORIZED",
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export enum RegisterErrorCodeEnum {
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
