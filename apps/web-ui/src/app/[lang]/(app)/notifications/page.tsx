"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { QueryError } from "@/components/query-error";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";
import { cn } from "@/utils";

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getRelativeTime(date: Date | string, locale: string): string {
	const now = new Date();
	const d = new Date(date);
	const diffMs = now.getTime() - d.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: "auto",
		style: "narrow",
	});

	if (diffSeconds < 60) return rtf.format(-diffSeconds, "second");
	if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
	if (diffHours < 24) return rtf.format(-diffHours, "hour");
	if (diffDays < 30) return rtf.format(-diffDays, "day");
	return d.toLocaleDateString(locale);
}

function NotificationsListSkeleton() {
	return (
		<div className="flex flex-col rounded-xl border bg-card divide-y">
			{[1, 2, 3, 4, 5].map((i) => (
				<div key={i} className="flex items-start gap-3 px-4 py-3">
					<Skeleton className="size-10 rounded-full shrink-0" />
					<div className="flex flex-col gap-1.5 flex-1">
						<Skeleton className="h-3.5 w-48" />
						<Skeleton className="h-3 w-64" />
						<Skeleton className="h-2.5 w-20" />
					</div>
				</div>
			))}
		</div>
	);
}

export default function NotificationsPage() {
	const { dictionary, locale } = useLocale();
	const d = dictionary.notifications;
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const notificationsQuery = useQuery(
		trpc.notifications.getNotifications.queryOptions({ page: 1 }),
	);

	const unreadCountQuery = useQuery(
		trpc.notifications.getUnreadCount.queryOptions(),
	);

	const unreadCount = unreadCountQuery.data ?? 0;

	const markAllAsReadMutation = useMutation(
		trpc.notifications.markAllAsRead.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.notifications.getUnreadCount.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.notifications.getNotifications.queryKey(),
				});
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	const getNotificationText = (type: string) => {
		switch (type) {
			case "LIKE":
				return d.likedYourPost;
			case "COMMENT":
				return d.commentedOnYourPost;
			case "REPLY":
				return d.repliedToYourComment;
			default:
				return "";
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">{d.title}</h1>
				<Button
					variant="ghost"
					size="sm"
					disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
					onClick={() => markAllAsReadMutation.mutate()}
				>
					{markAllAsReadMutation.isPending ? (
						<Loader2 className="animate-spin size-4" />
					) : (
						d.markAllAsRead
					)}
				</Button>
			</div>

			{notificationsQuery.isLoading && <NotificationsListSkeleton />}

			{notificationsQuery.isError && (
				<QueryError
					message={notificationsQuery.error.message}
					onRetry={() => notificationsQuery.refetch()}
				/>
			)}

			{!notificationsQuery.isLoading &&
				!notificationsQuery.isError &&
				notificationsQuery.data?.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">
						{d.empty}
					</p>
				)}

			{notificationsQuery.data && notificationsQuery.data.length > 0 && (
				<div className="flex flex-col rounded-xl border bg-card divide-y">
					{notificationsQuery.data.map((notification) => {
						const inner = (
							<>
								<Avatar className="size-10 shrink-0">
									<AvatarFallback className="text-sm">
										{getInitials(notification.actor.name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm leading-snug">
										<span className="font-semibold">
											{notification.actor.name}
										</span>{" "}
										{getNotificationText(notification.type)}
									</p>
									<p className="text-xs text-muted-foreground mt-0.5">
										{getRelativeTime(notification.createdAt, locale)}
									</p>
								</div>
							</>
						);

						const className = cn(
							"flex items-start gap-3 px-4 py-3 transition-colors first:rounded-t-xl last:rounded-b-xl",
							!notification.readAt && "bg-blue-50 dark:bg-blue-950/30",
						);

						return notification.postId ? (
							<Link
								key={notification.id}
								href={`/${locale}/posts/${notification.postId}`}
								className={cn(className, "hover:bg-accent")}
							>
								{inner}
							</Link>
						) : (
							<div key={notification.id} className={className}>
								{inner}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
