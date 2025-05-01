import { TRPCError } from "@trpc/server";

export const handleError = (
	originalError: unknown,
	defaultError: Pick<TRPCError, "message" | "code"> & Partial<TRPCError> = {
		message: "There was internal error in the server.",
		code: "INTERNAL_SERVER_ERROR",
	},
): TRPCError => {
	console.error(originalError);

	if (originalError instanceof TRPCError) {
		return originalError;
	}

	return new TRPCError({
		...defaultError,
	});
};
