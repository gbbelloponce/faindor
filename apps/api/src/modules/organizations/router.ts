import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { getOrganizationByDomain } from "./service";

const t = initTRPC.create();

export const organizationsRouter = t.router({
	getOrganizationByDomain: t.procedure
		.input(z.object({ domain: z.string() }))
		.query(async ({ input }) => {
			return await getOrganizationByDomain(input.domain);
		}),
});
