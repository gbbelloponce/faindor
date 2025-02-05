import { z } from "zod";

import { publicProcedure, router } from "@shared/trpc";
import { getOrganizationByDomain } from "./service";

export const organizationsRouter = router({
	getOrganizationByDomain: publicProcedure
		.input(z.object({ domain: z.string() }))
		.query(async ({ input }) => {
			return await getOrganizationByDomain(input.domain);
		}),
});
