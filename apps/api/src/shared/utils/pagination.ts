import { PAGE_SIZE } from "@/shared/constants";

export const getPaginationArgs = (page = 1) => ({
	take: PAGE_SIZE,
	skip: (page - 1) * PAGE_SIZE,
});
