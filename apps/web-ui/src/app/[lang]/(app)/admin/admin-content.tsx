"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Dictionary } from "@/dictionaries/types";
import { useTRPC } from "@/trpc/trpc";

function PostsListSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="rounded-lg border bg-card p-3 flex items-center justify-between"
				>
					<div className="flex flex-col gap-1 flex-1 min-w-0 mr-3">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-4 w-full" />
					</div>
					<Skeleton className="h-8 w-16 shrink-0" />
				</div>
			))}
		</div>
	);
}

export function AdminContent({ dictionary }: { dictionary: Dictionary }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const d = dictionary.admin.content;

	const postsQuery = useQuery(trpc.admin.getPosts.queryOptions({ page: 1 }));

	const deleteMutation = useMutation(
		trpc.admin.deletePost.mutationOptions({
			onSuccess: () => {
				toast.success(d.deleteSuccess);
				queryClient.invalidateQueries({
					queryKey: trpc.admin.getPosts.queryKey(),
				});
			},
			onError: (e) => toast.error(e.message ?? d.deleteError),
		}),
	);

	if (postsQuery.isLoading) return <PostsListSkeleton />;

	if (!postsQuery.data || postsQuery.data.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				{d.noPosts}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{postsQuery.data.map((post) => (
				<div
					key={post.id}
					className="rounded-lg border bg-card p-3 flex items-start justify-between gap-3"
				>
					<div className="flex flex-col gap-0.5 min-w-0 flex-1">
						<span className="text-xs text-muted-foreground">
							{post.author.name}
						</span>
						<p className="text-sm truncate">{post.content}</p>
						<span className="text-xs text-muted-foreground">
							{new Date(post.createdAt).toLocaleDateString()}
						</span>
					</div>
					<Button
						size="sm"
						variant="destructive"
						disabled={deleteMutation.isPending}
						onClick={() => {
							if (confirm(d.confirmDeletePost)) {
								deleteMutation.mutate({ postId: post.id });
							}
						}}
					>
						{deleteMutation.isPending ? (
							<Loader2 className="size-3 animate-spin" />
						) : (
							<Trash2 className="size-3" />
						)}
						<span className="sr-only">{d.deletePost}</span>
					</Button>
				</div>
			))}
		</div>
	);
}
