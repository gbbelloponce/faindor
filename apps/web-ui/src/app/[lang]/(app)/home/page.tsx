"use client";

import { CreatePostForm } from "./create-post-form";
import { PostFeed } from "./post-feed";

export default function Home() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
			<CreatePostForm />
			<PostFeed />
		</div>
	);
}
