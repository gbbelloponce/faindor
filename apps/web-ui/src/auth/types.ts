export interface User {
	id: number;
	name: string;
	role: string;
	email: string;
}

export interface AuthStorage {
	user: User | null;
}
