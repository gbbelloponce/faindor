"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";
import { CreatePostForm } from "../../home/create-post-form";
import { PostCard } from "../../home/post-card";

function GroupPostFeedSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			{[1, 2].map((i) => (
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

export default function GroupPage() {
	const { dictionary, locale } = useLocale();
	const params = useParams();
	const groupId = Number(params.id);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const groupQuery = useQuery(
		trpc.groups.getGroupById.queryOptions({ groupId }),
	);

	const postsQuery = useQuery(
		trpc.posts.getLatestsPostsByGroupId.queryOptions({ groupId, page: 1 }),
	);

	const joinGroupMutation = useMutation(
		trpc.groups.joinGroup.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupById.queryKey({ groupId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupsByOrganization.queryKey(),
				});
			},
			onError: () => {
				toast.error("Failed to join group");
			},
		}),
	);

	const leaveGroupMutation = useMutation(
		trpc.groups.leaveGroup.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupById.queryKey({ groupId }),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupsByOrganization.queryKey(),
				});
			},
			onError: () => {
				toast.error("Failed to leave group");
			},
		}),
	);

	const group = groupQuery.data;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
			<Link
				href={`/${locale}/groups`}
				className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
			>
				{dictionary.groups.backToGroups}
			</Link>

			{groupQuery.isLoading ? (
				<div className="rounded-xl border bg-card p-5 flex items-center gap-4">
					<Skeleton className="size-12 rounded-full" />
					<div className="flex flex-col gap-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
			) : group ? (
				<div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="flex size-12 items-center justify-center rounded-full bg-muted">
							<Users className="size-6 text-muted-foreground" />
						</div>
						<div>
							<h1 className="text-xl font-bold">{group.name}</h1>
							<p className="text-xs text-muted-foreground">
								{group._count.members} {dictionary.groups.members}
							</p>
						</div>
					</div>
					<Button
						size="sm"
						variant={group.isMember ? "outline" : "default"}
						disabled={
							joinGroupMutation.isPending || leaveGroupMutation.isPending
						}
						onClick={() => {
							if (group.isMember) {
								leaveGroupMutation.mutate({ groupId });
							} else {
								joinGroupMutation.mutate({ groupId });
							}
						}}
					>
						{group.isMember ? dictionary.groups.leave : dictionary.groups.join}
					</Button>
				</div>
			) : null}

			<CreatePostForm groupId={groupId} />

			{postsQuery.isLoading && <GroupPostFeedSkeleton />}

			{!postsQuery.isLoading && postsQuery.data?.length === 0 && (
				<p className="py-8 text-center text-sm text-muted-foreground">
					{dictionary.groups.emptyFeed}
				</p>
			)}

			{postsQuery.data && postsQuery.data.length > 0 && (
				<div className="flex flex-col gap-4">
					{postsQuery.data.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}
