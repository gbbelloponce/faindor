import { NeonDbError } from "@neondatabase/serverless";
import { DBError } from "@shared/types/errors";

export const parseDBError = (error: unknown) => {
	if (error instanceof NeonDbError) {
		console.error("NeonDbError with code: ", error.code);
		return new DBError("There was an error with the database");
	}
	return error;
};
