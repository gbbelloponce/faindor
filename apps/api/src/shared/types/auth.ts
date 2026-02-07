import type {
	Organization,
	User,
	UserRole,
} from "../../generated/prisma/client";

export interface LoggedUser {
	id: number;
	role: UserRole;
	organizationId: number;
}

export interface UserWithOrganization extends User {
	organization: Organization;
}
