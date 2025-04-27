import { RequireAuthProvider } from "@/auth/require-auth-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "./components/app-header";
import { AppSidebar } from "./components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<RequireAuthProvider>
			<SidebarProvider className="flex flex-col">
				<AppHeader />
				<div className="flex flex-1">
					<AppSidebar />
					<SidebarInset>{children}</SidebarInset>
				</div>
			</SidebarProvider>
		</RequireAuthProvider>
	);
}
