import Link from "next/link";

// Root-level fallback for paths that don't match any [lang] route.
// In practice the proxy redirects all traffic to /[lang]/..., so this
// is almost never shown — keep it simple and in English.
export default function RootNotFound() {
	return (
		<html lang="en">
			<body
				style={{
					display: "flex",
					minHeight: "100svh",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: "sans-serif",
					textAlign: "center",
					padding: "1rem",
				}}
			>
				<div>
					<p style={{ fontSize: "4rem", fontWeight: 700, color: "#aaa" }}>
						404
					</p>
					<h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
						Page not found
					</h1>
					<p style={{ color: "#888", marginBottom: "1.5rem" }}>
						The page you&apos;re looking for doesn&apos;t exist.
					</p>
					<Link
						href="/en/home"
						style={{ color: "inherit", textDecoration: "underline" }}
					>
						Go to home
					</Link>
				</div>
			</body>
		</html>
	);
}
