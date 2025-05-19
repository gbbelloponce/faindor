"use client";

import {
	Bell,
	LogOut,
	Search,
	Settings,
	SidebarIcon,
	User,
} from "lucide-react";
import Image from "next/image";

import { useAuth } from "@/auth/useAuth";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggler } from "@/components/theme-toggler";
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
import { Separator } from "@/components/ui/separator";
import { SidebarInput, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/utils";
import { useRouter } from "next/navigation";

export function AppHeader() {
	const router = useRouter();

	const isMobile = useIsMobile();
	const { toggleSidebar } = useSidebar();
	const { currentUser, logOut } = useAuth();

	const handleLogOut = () => {
		logOut();
		router.push("/login");
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
				<div className={cn("relative max-w-96", isMobile ? "w-full" : "w-3/4")}>
					<Label htmlFor="search" className="sr-only">
						Search
					</Label>
					<SidebarInput
						id="search"
						role="search"
						className="h-10 pl-8 w-full"
						placeholder="Search..."
					/>
					<Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
				</div>
			</form>

			<div className="flex items-center">
				<ThemeToggler buttonVariant="ghost" />
				<LocaleSwitcher buttonVariant="ghost" />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="ghost">
							<Bell />
							<span className="sr-only">Notifications</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-80" align="end">
						<DropdownMenuLabel className="text-base font-medium">
							Notifications
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<div className="max-h-[calc(60vh-4rem)] overflow-y-auto">
							<DropdownMenuGroup>
								{Array.from({ length: 30 }).map((_, i) => (
									<DropdownMenuItem key={`notification-${i + 1}`}>
										Notification {i + 1}
									</DropdownMenuItem>
								))}
								<div className="my-2 flex items-center justify-center">
									<Button size="sm" variant="outline" className="w-1/2">
										Load More
									</Button>
								</div>
							</DropdownMenuGroup>
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
							<DropdownMenuItem>
								<User />
								<span>My Profile</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings />
								<span>Settings</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem onClick={handleLogOut}>
								<LogOut className="text-destructive" />
								<span className="text-destructive">Log out</span>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
