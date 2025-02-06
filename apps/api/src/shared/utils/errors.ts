import { NeonDbError } from "@neondatabase/serverless";
import { TRPCError } from "@trpc/server";

export const parseDBError = (error: unknown) => {
	if (error instanceof NeonDbError) {
		console.error("NeonDbError with code: ", error.code);
		return new TRPCError({
			message: "There was an error with the database",
			code: "INTERNAL_SERVER_ERROR",
		});
	}
	return error;
};
