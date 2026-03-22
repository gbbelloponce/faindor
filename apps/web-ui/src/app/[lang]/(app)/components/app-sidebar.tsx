"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Calendar,
	Home,
	MessageSquare,
	Shield,
	ShoppingBag,
	Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useAuthStore } from "@/auth/useAuth";
import { Badge } from "@/components/ui/badge";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";

export function AppSidebar() {
	const { locale } = useLocale();
	const { currentUser } = useAuthStore();
	const trpc = useTRPC();

	const unreadCountQuery = useQuery({
		...trpc.messages.getUnreadCount.queryOptions(),
		refetchInterval: 15_000,
	});

	const unreadCount = unreadCountQuery.data ?? 0;

	const navItems = [
		{ icon: Home, href: `/${locale}/home`, label: "Home" },
		{ icon: Calendar, href: `/${locale}/events`, label: "Events" },
		{ icon: Users, href: `/${locale}/groups`, label: "Groups" },
		{
			icon: MessageSquare,
			href: `/${locale}/messages`,
			label: "Messages",
			badge: unreadCount > 0 ? unreadCount : null,
		},
		{ icon: ShoppingBag, href: `/${locale}/marketplace`, label: "Marketplace" },
		...(currentUser?.role === "APP_ADMIN"
			? [{ icon: Shield, href: `/${locale}/admin`, label: "Admin" }]
			: []),
	];

	return (
		<Sidebar className="top-16 !h-[calc(100vh-4rem)]">
			<SidebarContent className="p-6 flex flex-col gap-2">
				<nav>
					<ul className="flex list-none flex-col gap-2">
						{navItems.map((navItem) => (
							<li key={navItem.href} className="flex w-full">
								<Link
									href={navItem.href}
									className="flex items-center hover:bg-accent rounded-full p-3 w-full h-full"
								>
									<navItem.icon className="mr-2 h-5 w-5" />
									{navItem.label}
									{"badge" in navItem && navItem.badge ? (
										<Badge className="ml-auto h-5 min-w-5 px-1.5 text-xs">
											{navItem.badge}
										</Badge>
									) : null}
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</SidebarContent>
			<SidebarFooter className="p-6 flex items-center">
				<Link
					href="https://github.com/gbbelloponce/faindor"
					target="_blank"
					rel="noopener noreferrer"
					className="px-3 py-2 flex items-center gap-2 rounded-full backdrop-blur-sm bg-[var(--logo-color)] dark:bg-sidebar border shadow-sm hover:shadow transition-all duration-300 hover:scale-105 select-none "
				>
					<div>
						<Image
							src="/faindor-logo-rounded.png"
							alt="Faindor Logo"
							width={24}
							height={24}
						/>
					</div>
					<span className="text-xs font-medium">
						Powered by{" "}
						<span className="font-extrabold dark:text-[var(--logo-color)]">
							Faindor
						</span>
					</span>
				</Link>
			</SidebarFooter>
		</Sidebar>
	);
}
