import { Skeleton } from "@/components/ui/skeleton";

// Route-level Suspense fallback — shown during initial render of any (app) page.
// The app shell (header + sidebar) is already mounted via layout.tsx,
// so this only needs to fill the SidebarInset content area.
export default function Loading() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto w-full">
			<Skeleton className="h-6 w-36" />
			<div className="flex flex-col gap-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="rounded-xl border bg-card p-4">
						<div className="flex items-center gap-3">
							<Skeleton className="size-8 rounded-full" />
							<Skeleton className="h-4 w-32" />
						</div>
						<Skeleton className="mt-3 h-16 w-full" />
						<div className="mt-3 flex gap-4">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-4 w-20" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
