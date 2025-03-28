import { NeonDbError } from "@neondatabase/serverless";
import { TRPCError } from "@trpc/server";

export const checkDBError = (error: unknown) => {
	if (error instanceof NeonDbError) {
		console.error("NeonDbError with code: ", error.code);
	}

	if (error instanceof TRPCError) {
		return error;
	}

	console.error(error);

	return new TRPCError({
		message:
			"There was an error with the database, check the server logs for more info.",
		code: "INTERNAL_SERVER_ERROR",
	});
};
