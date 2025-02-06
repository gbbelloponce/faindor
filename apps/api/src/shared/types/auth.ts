import type { UserRoles } from "./roles";

export interface LoggedUser {
	id: number;
	role: UserRoles;
	domain: string;
}
