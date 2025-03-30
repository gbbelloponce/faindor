import { AuthProvider } from "@/components/auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <AuthProvider>{children}</AuthProvider>;
}
