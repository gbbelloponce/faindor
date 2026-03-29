"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { QueryError } from "@/components/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Dictionary } from "@/dictionaries/types";
import { useTRPC } from "@/trpc/trpc";

function UsersTableSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className="flex items-center justify-between rounded-lg border p-3"
				>
					<div className="flex flex-col gap-1">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-48" />
					</div>
					<Skeleton className="h-8 w-24" />
				</div>
			))}
		</div>
	);
}

function getUserStatus(user: {
	active: boolean;
	deletedAt: Date | string | null;
}) {
	if (user.deletedAt) return "deleted";
	if (!user.active) return "suspended";
	return "active";
}

export function AdminUsers({ dictionary }: { dictionary: Dictionary }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const d = dictionary.admin.users;

	const usersQuery = useQuery(trpc.admin.getUsers.queryOptions({ page: 1 }));

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: trpc.admin.getUsers.queryKey() });

	const suspendMutation = useMutation(
		trpc.admin.suspendUser.mutationOptions({
			onSuccess: () => {
				toast.success(d.actionSuccess);
				invalidate();
			},
			onError: (e) => toast.error(e.message ?? d.actionError),
		}),
	);

	const activateMutation = useMutation(
		trpc.admin.activateUser.mutationOptions({
			onSuccess: () => {
				toast.success(d.actionSuccess);
				invalidate();
			},
			onError: (e) => toast.error(e.message ?? d.actionError),
		}),
	);

	const deleteMutation = useMutation(
		trpc.admin.deleteUser.mutationOptions({
			onSuccess: () => {
				toast.success(d.actionSuccess);
				invalidate();
			},
			onError: (e) => toast.error(e.message ?? d.actionError),
		}),
	);

	const promoteMutation = useMutation(
		trpc.admin.promoteToAdmin.mutationOptions({
			onSuccess: () => {
				toast.success(d.actionSuccess);
				invalidate();
			},
			onError: (e) => toast.error(e.message ?? d.actionError),
		}),
	);

	const revokeMutation = useMutation(
		trpc.admin.revokeAdmin.mutationOptions({
			onSuccess: () => {
				toast.success(d.actionSuccess);
				invalidate();
			},
			onError: (e) => toast.error(e.message ?? d.actionError),
		}),
	);

	const isBusy =
		suspendMutation.isPending ||
		activateMutation.isPending ||
		deleteMutation.isPending ||
		promoteMutation.isPending ||
		revokeMutation.isPending;

	if (usersQuery.isLoading) return <UsersTableSkeleton />;

	if (usersQuery.isError) {
		return (
			<QueryError
				message={usersQuery.error.message}
				onRetry={() => usersQuery.refetch()}
			/>
		);
	}

	if (!usersQuery.data || usersQuery.data.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				{d.noUsers}
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{usersQuery.data.map((user) => {
				const status = getUserStatus(user);
				return (
					<div
						key={user.id}
						className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card p-3"
					>
						<div className="flex flex-col gap-0.5 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<span className="font-medium truncate">{user.name}</span>
								{user.role === "APP_ADMIN" && (
									<Badge variant="default" className="text-xs">
										Admin
									</Badge>
								)}
								<Badge
									variant={
										status === "active"
											? "outline"
											: status === "suspended"
												? "secondary"
												: "destructive"
									}
									className="text-xs"
								>
									{status === "active"
										? d.active
										: status === "suspended"
											? d.suspended
											: d.deleted}
								</Badge>
							</div>
							<span className="text-xs text-muted-foreground truncate">
								{user.email}
							</span>
							<span className="text-xs text-muted-foreground">
								{d.joined}: {new Date(user.createdAt).toLocaleDateString()}
							</span>
						</div>

						{status !== "deleted" && (
							<div className="flex flex-wrap gap-1 shrink-0">
								{status === "active" ? (
									<Button
										size="sm"
										variant="outline"
										disabled={isBusy}
										onClick={() => {
											if (confirm(d.confirmSuspend)) {
												suspendMutation.mutate({ userId: user.id });
											}
										}}
									>
										{suspendMutation.isPending ? (
											<Loader2 className="size-3 animate-spin" />
										) : (
											d.suspend
										)}
									</Button>
								) : (
									<Button
										size="sm"
										variant="outline"
										disabled={isBusy}
										onClick={() => activateMutation.mutate({ userId: user.id })}
									>
										{activateMutation.isPending ? (
											<Loader2 className="size-3 animate-spin" />
										) : (
											d.activate
										)}
									</Button>
								)}

								{user.role === "APP_ADMIN" ? (
									<Button
										size="sm"
										variant="outline"
										disabled={isBusy}
										onClick={() => revokeMutation.mutate({ userId: user.id })}
									>
										{revokeMutation.isPending ? (
											<Loader2 className="size-3 animate-spin" />
										) : (
											d.revokeAdmin
										)}
									</Button>
								) : (
									<Button
										size="sm"
										variant="outline"
										disabled={isBusy}
										onClick={() => promoteMutation.mutate({ userId: user.id })}
									>
										{promoteMutation.isPending ? (
											<Loader2 className="size-3 animate-spin" />
										) : (
											d.promoteToAdmin
										)}
									</Button>
								)}

								<Button
									size="sm"
									variant="destructive"
									disabled={isBusy}
									onClick={() => {
										if (confirm(d.confirmDelete)) {
											deleteMutation.mutate({ userId: user.id });
										}
									}}
								>
									{deleteMutation.isPending ? (
										<Loader2 className="size-3 animate-spin" />
									) : (
										d.delete
									)}
								</Button>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
