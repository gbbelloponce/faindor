"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";
import { PostCard } from "../../home/post-card";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function ProfileHeaderSkeleton() {
	return (
		<div className="rounded-xl border bg-card p-6 flex items-center gap-5">
			<Skeleton className="size-16 rounded-full" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
	);
}

function PostFeedSkeleton() {
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

export default function ProfilePage() {
	const { dictionary } = useLocale();
	const params = useParams();
	const userId = Number(params.id);
	const trpc = useTRPC();

	const userQuery = useQuery(
		trpc.users.getPublicUserInfoById.queryOptions({ id: userId }),
	);

	const postsQuery = useQuery(
		trpc.posts.getLatestsPostsByUserId.queryOptions({ userId, page: 1 }),
	);

	const user = userQuery.data;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
			{userQuery.isLoading ? (
				<ProfileHeaderSkeleton />
			) : user ? (
				<div className="rounded-xl border bg-card p-6 flex items-center gap-5">
					<Avatar className="size-16">
						<AvatarFallback className="text-xl">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-xl font-bold">{user.name}</h1>
						<p className="text-sm text-muted-foreground">{user.email}</p>
						<p className="text-xs text-muted-foreground mt-0.5">
							{user.organization.name}
						</p>
					</div>
				</div>
			) : null}

			<h2 className="font-semibold">{dictionary.profile.posts}</h2>

			{postsQuery.isLoading && <PostFeedSkeleton />}

			{!postsQuery.isLoading && postsQuery.data?.length === 0 && (
				<p className="py-8 text-center text-sm text-muted-foreground">
					{dictionary.profile.noPosts}
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
