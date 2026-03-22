import type {
	Organization,
	User,
	UserRole,
} from "../db/generated/prisma/client";

export interface LoggedUser {
	id: number;
	role: UserRole;
	organizationId: number;
	tokenVersion: number;
}

export interface UserWithOrganization extends User {
	organization: Organization;
}
