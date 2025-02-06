import { z } from "zod";

import { authenticatedProcedure, router } from "@shared/trpc";
import { getOrganizationByDomain } from "./service";

export const organizationsRouter = router({
	getOrganizationByDomain: authenticatedProcedure
		.input(z.object({ domain: z.string() }))
		.query(async ({ input }) => {
			return await getOrganizationByDomain(input.domain);
		}),
});
