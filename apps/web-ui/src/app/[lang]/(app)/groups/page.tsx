"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";

function GroupsListSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="rounded-xl border bg-card p-4 flex items-center justify-between"
				>
					<div className="flex flex-col gap-2">
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-3 w-24" />
					</div>
					<Skeleton className="h-9 w-20" />
				</div>
			))}
		</div>
	);
}

export default function GroupsPage() {
	const { dictionary, locale } = useLocale();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [showCreate, setShowCreate] = useState(false);
	const [groupName, setGroupName] = useState("");

	const groupsQuery = useQuery(
		trpc.groups.getGroupsByOrganization.queryOptions(),
	);

	const createGroupMutation = useMutation(
		trpc.groups.createGroup.mutationOptions({
			onSuccess: () => {
				setGroupName("");
				setShowCreate(false);
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupsByOrganization.queryKey(),
				});
			},
			onError: (error) => {
				toast.error(error.message ?? dictionary.groups.createError);
			},
		}),
	);

	const joinGroupMutation = useMutation(
		trpc.groups.joinGroup.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupsByOrganization.queryKey(),
				});
			},
			onError: () => {
				toast.error(dictionary.groups.joinError);
			},
		}),
	);

	const leaveGroupMutation = useMutation(
		trpc.groups.leaveGroup.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.groups.getGroupsByOrganization.queryKey(),
				});
			},
			onError: () => {
				toast.error(dictionary.groups.leaveError);
			},
		}),
	);

	const handleCreate = () => {
		if (!groupName.trim()) return;
		createGroupMutation.mutate({ name: groupName });
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">{dictionary.groups.title}</h1>
				<Button
					size="sm"
					variant={showCreate ? "outline" : "default"}
					onClick={() => {
						setShowCreate((v) => !v);
						setGroupName("");
					}}
				>
					{showCreate
						? dictionary.groups.cancel
						: dictionary.groups.createGroup}
				</Button>
			</div>

			{showCreate && (
				<div className="rounded-xl border bg-card p-4 flex gap-2">
					<Input
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
						placeholder={dictionary.groups.groupNamePlaceholder}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleCreate();
						}}
						autoFocus
					/>
					<Button
						size="sm"
						onClick={handleCreate}
						disabled={!groupName.trim() || createGroupMutation.isPending}
					>
						{createGroupMutation.isPending ? (
							<Loader2 className="animate-spin" />
						) : (
							dictionary.groups.createGroup
						)}
					</Button>
				</div>
			)}

			{groupsQuery.isLoading && <GroupsListSkeleton />}

			{groupsQuery.isError && (
				<QueryError
					message={groupsQuery.error.message}
					onRetry={() => groupsQuery.refetch()}
				/>
			)}

			{!groupsQuery.isLoading &&
				!groupsQuery.isError &&
				groupsQuery.data?.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">
						{dictionary.groups.noGroups}
					</p>
				)}

			{groupsQuery.data && groupsQuery.data.length > 0 && (
				<div className="flex flex-col gap-3">
					{groupsQuery.data.map((group) => (
						<div
							key={group.id}
							className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
									<Users className="size-5 text-muted-foreground" />
								</div>
								<div className="min-w-0">
									<Link
										href={`/${locale}/groups/${group.id}`}
										className="font-semibold hover:underline truncate block"
									>
										{group.name}
									</Link>
									<p className="text-xs text-muted-foreground">
										{group._count.members} {dictionary.groups.members} ·{" "}
										{group._count.posts} {dictionary.groups.posts}
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
										leaveGroupMutation.mutate({ groupId: group.id });
									} else {
										joinGroupMutation.mutate({ groupId: group.id });
									}
								}}
							>
								{group.isMember
									? dictionary.groups.leave
									: dictionary.groups.join}
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
