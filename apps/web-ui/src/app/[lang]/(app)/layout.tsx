import { RequireAuthProvider } from "@/auth/require-auth-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return <RequireAuthProvider>{children}</RequireAuthProvider>;
}
