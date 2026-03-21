"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { PostCard } from "@/app/[lang]/(app)/home/post-card";
import { useTRPC } from "@/trpc/trpc";

export default function PostPage() {
	const trpc = useTRPC();
	const params = useParams();
	const postId = Number(params.id);

	const {
		data: post,
		isLoading,
		isError,
	} = useQuery(trpc.posts.getPostById.queryOptions({ postId }));

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col p-4 max-w-2xl mx-auto w-full">
				<div className="rounded-xl border bg-card p-4 animate-pulse h-32" />
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="flex flex-1 flex-col p-4 max-w-2xl mx-auto w-full">
				<p className="text-sm text-muted-foreground text-center py-8">
					Post not found.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col p-4 max-w-2xl mx-auto w-full">
			<PostCard post={post} />
		</div>
	);
}
