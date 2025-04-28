import Image from "next/image";
import Link from "next/link";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

import { Calendar, Home, ImageIcon, ShoppingBag, Users } from "lucide-react";

const navItems = [
	{ icon: Home, href: "/home", label: "Home" },
	{ icon: Calendar, href: "/calendar", label: "Events" },
	{ icon: Users, href: "/communities", label: "Communities" },
	{ icon: ImageIcon, href: "/photos", label: "Photos" },
	{ icon: ShoppingBag, href: "/marketplace", label: "Marketplace" },
];

export function AppSidebar() {
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
									{<navItem.icon className="mr-2 h-5 w-5" />} {navItem.label}
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
