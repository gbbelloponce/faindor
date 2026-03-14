"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";
import { PostCard } from "./post-card";

function PostFeedSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center gap-3">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="mt-3 h-16 w-full" />
				<div className="mt-3 flex gap-4">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center gap-3">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="mt-3 h-16 w-full" />
				<div className="mt-3 flex gap-4">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
			<div className="rounded-xl border bg-card p-4">
				<div className="flex items-center gap-3">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="mt-3 h-16 w-full" />
				<div className="mt-3 flex gap-4">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-20" />
				</div>
			</div>
		</div>
	);
}

export function PostFeed() {
	const { dictionary } = useLocale();
	const trpc = useTRPC();

	const postsQuery = useQuery(
		trpc.posts.getLatestsPosts.queryOptions({ page: 1 }),
	);

	if (postsQuery.isLoading) {
		return <PostFeedSkeleton />;
	}

	if (!postsQuery.data || postsQuery.data.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				{dictionary.home.emptyFeed}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{postsQuery.data.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
		</div>
	);
}
