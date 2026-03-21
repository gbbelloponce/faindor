import { Hono } from "hono";

import { supabase } from "@/shared/supabase";
import { decodeAccessToken } from "@/shared/utils/token";

const ALLOWED_BUCKETS = ["avatars", "post-images"] as const;
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];

export const uploadRoute = new Hono();

uploadRoute.post("/sign", async (c) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

	const [, token] = authHeader.split(" ");
	if (!token) return c.json({ error: "Unauthorized" }, 401);

	let user: { id: number };
	try {
		user = await decodeAccessToken(token);
	} catch {
		return c.json({ error: "Unauthorized" }, 401);
	}

	let body: { bucket?: string; filename?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const { bucket, filename } = body;

	if (!bucket || !(ALLOWED_BUCKETS as readonly string[]).includes(bucket)) {
		return c.json({ error: "Invalid bucket" }, 400);
	}

	const ext = filename?.split(".").pop();
	if (!ext) return c.json({ error: "Invalid filename" }, 400);

	const path = `${user.id}/${Date.now()}.${ext}`;

	const { data, error } = await supabase.storage
		.from(bucket as AllowedBucket)
		.createSignedUploadUrl(path);

	if (error) {
		console.error("Failed to create signed upload URL:", error);
		return c.json({ error: "Failed to create signed URL" }, 500);
	}

	return c.json({ signedUrl: data.signedUrl, path });
});
