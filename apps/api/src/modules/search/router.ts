import { authenticatedProcedure, router } from "@/shared/trpc";
import { search } from "./service";
import { searchSchema } from "./types/request";

export const searchRouter = router({
	search: authenticatedProcedure
		.input(searchSchema)
		.query(async ({ input, ctx }) => {
			return await search(input.query, ctx.user.organizationId);
		}),
});
