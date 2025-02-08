import type { UserRoles } from "./roles";

export interface LoggedUser {
	id: number;
	role: UserRoles;
	organizationId: number;
}
