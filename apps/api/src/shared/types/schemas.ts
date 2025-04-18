import { z } from "zod";

export const positiveNumberSchema = z.coerce
	.number()
	.int()
	.positive()
	.min(1)
	.safe();
