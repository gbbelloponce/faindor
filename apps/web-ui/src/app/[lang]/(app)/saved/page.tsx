"use client";

import { useQuery } from "@tanstack/react-query";

import { QueryError } from "@/components/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";
import { PostCard } from "../home/post-card";

function SavedPostsSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{[1, 2, 3].map((i) => (
				<div key={i} className="rounded-xl border bg-card p-4">
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
			))}
		</div>
	);
}

export default function SavedPage() {
	const { dictionary } = useLocale();
	const trpc = useTRPC();

	const savedPostsQuery = useQuery(
		trpc.posts.getSavedPosts.queryOptions({ page: 1 }),
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
			<h1 className="text-xl font-bold">{dictionary.saved.title}</h1>

			{savedPostsQuery.isLoading && <SavedPostsSkeleton />}

			{savedPostsQuery.isError && (
				<QueryError
					message={savedPostsQuery.error.message}
					onRetry={() => savedPostsQuery.refetch()}
				/>
			)}

			{!savedPostsQuery.isLoading &&
				!savedPostsQuery.isError &&
				savedPostsQuery.data?.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">
						{dictionary.profile.noSavedPosts}
					</p>
				)}

			{savedPostsQuery.data && savedPostsQuery.data.length > 0 && (
				<div className="flex flex-col gap-4">
					{savedPostsQuery.data.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}
