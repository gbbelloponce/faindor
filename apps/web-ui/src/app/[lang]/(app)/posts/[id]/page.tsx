"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { PostCard } from "@/app/[lang]/(app)/home/post-card";
import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
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
				<div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
					<div className="flex items-center gap-3">
						<Skeleton className="size-8 rounded-full" />
						<Skeleton className="h-4 w-32" />
					</div>
					<Skeleton className="h-16 w-full" />
					<div className="flex gap-4">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="flex flex-1 flex-col p-4 max-w-2xl mx-auto w-full">
				<QueryError message="Post not found." />
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col p-4 max-w-2xl mx-auto w-full">
			<PostCard post={post} />
		</div>
	);
}
