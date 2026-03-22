import { RequireAdminProvider } from "@/auth/require-admin-provider";

export default function AdminLayout({
	children,
}: { children: React.ReactNode }) {
	return <RequireAdminProvider>{children}</RequireAdminProvider>;
}
