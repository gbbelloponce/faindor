"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Monitor } from "lucide-react";
import { toast } from "sonner";

import { QueryError } from "@/components/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";

function EventsListSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="rounded-xl border bg-card p-4 flex flex-col gap-2"
				>
					<Skeleton className="h-5 w-48" />
					<Skeleton className="h-3 w-32" />
					<Skeleton className="h-3 w-40" />
				</div>
			))}
		</div>
	);
}

export default function EventsPage() {
	const { dictionary } = useLocale();
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const d = dictionary.events;

	const eventsQuery = useQuery(trpc.events.getEvents.queryOptions({ page: 1 }));

	const rsvpMutation = useMutation(
		trpc.events.rsvp.mutationOptions({
			onSuccess: () => {
				toast.success(d.rsvpSuccess);
				queryClient.invalidateQueries({
					queryKey: trpc.events.getEvents.queryKey(),
				});
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
			<h1 className="text-xl font-bold">{d.title}</h1>

			{eventsQuery.isLoading && <EventsListSkeleton />}

			{eventsQuery.isError && (
				<QueryError
					message={eventsQuery.error.message}
					onRetry={() => eventsQuery.refetch()}
				/>
			)}

			{!eventsQuery.isLoading &&
				!eventsQuery.isError &&
				eventsQuery.data?.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">
						{d.noEvents}
					</p>
				)}

			{eventsQuery.data && eventsQuery.data.length > 0 && (
				<div className="flex flex-col gap-3">
					{eventsQuery.data.map((event) => (
						<div
							key={event.id}
							className="rounded-xl border bg-card p-4 flex flex-col gap-3"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="font-semibold leading-snug">
										{event.title}
									</span>
									{event.description && (
										<p className="text-sm text-muted-foreground">
											{event.description}
										</p>
									)}
								</div>
								<span className="text-sm text-muted-foreground shrink-0">
									{event._count.rsvps} {d.going}
								</span>
							</div>

							<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<Calendar className="size-3" />
									{new Date(event.startsAt).toLocaleString()}
									{event.endsAt &&
										` — ${new Date(event.endsAt).toLocaleString()}`}
								</span>
								{event.location && (
									<span className="flex items-center gap-1">
										<MapPin className="size-3" />
										{event.location}
									</span>
								)}
								{event.onlineUrl && (
									<a
										href={event.onlineUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1 hover:underline"
									>
										<Monitor className="size-3" />
										{d.onlineEvent}
									</a>
								)}
							</div>

							<div className="flex gap-2">
								<Button
									size="sm"
									variant="default"
									disabled={rsvpMutation.isPending}
									onClick={() =>
										rsvpMutation.mutate({ eventId: event.id, status: "GOING" })
									}
								>
									{d.going}
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={rsvpMutation.isPending}
									onClick={() =>
										rsvpMutation.mutate({
											eventId: event.id,
											status: "NOT_GOING",
										})
									}
								>
									{d.notGoing}
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
