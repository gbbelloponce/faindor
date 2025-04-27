import Image from "next/image";
import Link from "next/link";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
	return (
		<Sidebar className="top-16 !h-[calc(100vh-4rem)]">
			<SidebarContent className="p-6">Sidebar</SidebarContent>
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
