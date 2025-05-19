import type { UserRole } from "@prisma/client";

export interface LoggedUser {
	id: number;
	role: UserRole;
	organizationId: number;
}
