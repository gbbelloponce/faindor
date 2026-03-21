"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Bell,
	LogOut,
	Search,
	Settings,
	SidebarIcon,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/auth/useAuth";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggler } from "@/components/theme-toggler";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarInput, useSidebar } from "@/components/ui/sidebar";
import { useLocale } from "@/dictionaries/useLocale";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase";
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

function getRelativeTime(date: Date | string): string {
	const now = new Date();
	const d = new Date(date);
	const diffMs = now.getTime() - d.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) return "just now";
	if (diffMinutes < 60) return `${diffMinutes}m`;
	if (diffHours < 24) return `${diffHours}h`;
	if (diffDays < 30) return `${diffDays}d`;
	return d.toLocaleDateString();
}

export function AppHeader() {
	const router = useRouter();
	const isMobile = useIsMobile();
	const { toggleSidebar } = useSidebar();
	const { currentUser, logOut } = useAuth();
	const { locale, dictionary } = useLocale();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const notificationsQuery = useQuery(
		trpc.notifications.getNotifications.queryOptions({ page: 1 }),
	);

	const unreadCountQuery = useQuery(
		trpc.notifications.getUnreadCount.queryOptions(),
	);

	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
		return () => clearTimeout(timer);
	}, [query]);

	const searchQuery = useQuery({
		...trpc.search.search.queryOptions({ query: debouncedQuery }),
		enabled: debouncedQuery.length >= 2,
	});

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
		}),
	);

	useEffect(() => {
		const userId = currentUser?.id;
		if (!userId) return;

		const channel = supabase
			.channel(`notifications:user:${userId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "notifications",
					filter: `recipientId=eq.${userId}`,
				},
				() => {
					queryClient.invalidateQueries({
						queryKey: trpc.notifications.getUnreadCount.queryKey(),
					});
					queryClient.invalidateQueries({
						queryKey: trpc.notifications.getNotifications.queryKey(),
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [
		currentUser?.id,
		queryClient,
		trpc.notifications.getUnreadCount,
		trpc.notifications.getNotifications,
	]);

	const handleLogOut = () => {
		logOut();
		router.push("/login");
	};

	const unreadCount = unreadCountQuery.data ?? 0;

	const getNotificationText = (type: string) => {
		switch (type) {
			case "LIKE":
				return dictionary.notifications.likedYourPost;
			case "COMMENT":
				return dictionary.notifications.commentedOnYourPost;
			case "REPLY":
				return dictionary.notifications.repliedToYourComment;
			default:
				return "";
		}
	};

	return (
		<header className="h-16 flex sticky top-0 z-[var(--header-z-index)] justify-between gap-6 px-4 bg-sidebar border-b">
			<div className="flex gap-2 items-center">
				<Button variant="ghost" size="icon" onClick={toggleSidebar}>
					<SidebarIcon />
					<span className="sr-only">Toggle Sidebar</span>
				</Button>
				<Separator orientation="vertical" className="mr-2 max-h-4" />

				<div className="flex items-center">
					<Image
						src="/faindor-logo-rounded.png"
						alt="Faindor Logo"
						width={24}
						height={24}
					/>
					<span
						className={cn("ml-2 text-lg font-bold select-none", {
							hidden: isMobile,
						})}
					>
						{currentUser?.organization.name}
					</span>
				</div>
			</div>

			<form
				onSubmit={(e) => e.preventDefault()}
				className="flex flex-1 items-center justify-center"
			>
				<Popover
					open={debouncedQuery.length >= 2}
					onOpenChange={(open) => {
						if (!open) setQuery("");
					}}
				>
					<PopoverAnchor asChild>
						<div
							className={cn("relative max-w-96", isMobile ? "w-full" : "w-3/4")}
						>
							<Label htmlFor="search" className="sr-only">
								Search
							</Label>
							<SidebarInput
								id="search"
								role="search"
								className="h-10 pl-8 w-full"
								placeholder={dictionary.search.placeholder}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							<Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
						</div>
					</PopoverAnchor>
					<PopoverContent
						className="w-[var(--radix-popover-anchor-width)] p-2"
						onOpenAutoFocus={(e) => e.preventDefault()}
						align="start"
					>
						{!searchQuery.data ||
						(searchQuery.data.users.length === 0 &&
							searchQuery.data.posts.length === 0) ? (
							<p className="text-sm text-muted-foreground text-center py-2">
								{searchQuery.isLoading ? "…" : dictionary.search.noResults}
							</p>
						) : (
							<div className="space-y-3">
								{searchQuery.data.users.length > 0 && (
									<div>
										<p className="text-xs font-medium text-muted-foreground px-2 pb-1">
											{dictionary.search.users}
										</p>
										{searchQuery.data.users.map((user) => (
											<Link
												key={user.id}
												href={`/${locale}/profile/${user.id}`}
												onClick={() => setQuery("")}
												className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
											>
												<Avatar className="size-6 shrink-0">
													<AvatarFallback className="text-xs">
														{getInitials(user.name)}
													</AvatarFallback>
												</Avatar>
												<span>{user.name}</span>
											</Link>
										))}
									</div>
								)}
								{searchQuery.data.posts.length > 0 && (
									<div>
										<p className="text-xs font-medium text-muted-foreground px-2 pb-1">
											{dictionary.search.posts}
										</p>
										{searchQuery.data.posts.map((post) => (
											<Link
												key={post.id}
												href={`/${locale}/posts/${post.id}`}
												onClick={() => setQuery("")}
												className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
											>
												<span className="truncate text-muted-foreground">
													{post.content.length > 80
														? `${post.content.slice(0, 80)}…`
														: post.content}
												</span>
											</Link>
										))}
									</div>
								)}
							</div>
						)}
					</PopoverContent>
				</Popover>
			</form>

			<div className="flex items-center">
				<ThemeToggler buttonVariant="ghost" />
				<LocaleSwitcher buttonVariant="ghost" />

				<DropdownMenu
					onOpenChange={(open) => {
						if (open && unreadCount > 0) markAllAsReadMutation.mutate();
					}}
				>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost" className="relative">
							<Bell />
							{unreadCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							)}
							<span className="sr-only">{dictionary.notifications.title}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-80" align="end">
						<DropdownMenuLabel className="text-base font-medium">
							{dictionary.notifications.title}
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<div className="max-h-[calc(60vh-4rem)] overflow-y-auto">
							{!notificationsQuery.data ||
							notificationsQuery.data.length === 0 ? (
								<p className="py-6 text-center text-sm text-muted-foreground">
									{dictionary.notifications.empty}
								</p>
							) : (
								<DropdownMenuGroup>
									{notificationsQuery.data.map((notification) => (
										<DropdownMenuItem
											key={notification.id}
											asChild
											className={cn(
												!notification.readAt &&
													"bg-blue-50 dark:bg-blue-950/30",
											)}
										>
											<Link
												href={`/${locale}/profile/${notification.actor.id}`}
												className="flex items-start gap-3 px-3 py-2"
											>
												<Avatar className="size-8 shrink-0">
													<AvatarFallback className="text-xs">
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
														{getRelativeTime(notification.createdAt)}
													</p>
												</div>
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuGroup>
							)}
						</div>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost">
							<User />
							<span className="sr-only">Account</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-60" align="end">
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">
									{currentUser?.name}
								</p>
								<span className="text-xs leading-none text-muted-foreground">
									{currentUser?.email}
								</span>
							</div>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href={`/${locale}/profile/${currentUser?.id}`}>
									<User />
									<span>My Profile</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings />
								<span>Settings</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Button
									variant="ghost"
									className="w-full justify-start cursor-pointer hover:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
									onClick={handleLogOut}
								>
									<LogOut className="h-4 w-4 text-destructive" />
									<span className="text-destructive">Log out</span>
								</Button>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
