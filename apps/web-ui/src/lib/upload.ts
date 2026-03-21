import Cookies from "js-cookie";

import { ACCESS_TOKEN_COOKIE_KEY } from "@/auth/constants";
import { supabase } from "@/lib/supabase";

type StorageBucket = "avatars" | "post-images";

export async function uploadToStorage(
	file: File,
	bucket: StorageBucket,
): Promise<string> {
	const token = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);

	const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/sign`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
		},
		body: JSON.stringify({ bucket, filename: file.name }),
	});

	if (!res.ok) throw new Error("Failed to get signed upload URL");

	const { signedUrl, path } = await res.json();

	const uploadRes = await fetch(signedUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: file,
	});

	if (!uploadRes.ok) throw new Error("Failed to upload file");

	return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
