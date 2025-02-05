import { initTRPC } from "@trpc/server";
import { z } from "zod";

import { positiveNumberSchema } from "../../shared/types/schemas";

const t = initTRPC.create();

export const usersRouter = t.router({
	getById: t.procedure
		.input(z.object({ id: positiveNumberSchema }))
		.query(({ input }) => {
			return { user: { id: input.id, name: "John Doe" } };
		}),
});
