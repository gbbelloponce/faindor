"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, MapPin, Monitor } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/dictionaries/types";
import { useTRPC } from "@/trpc/trpc";

const schema = z.object({
	title: z.string().trim().min(1, { error: "Title is required." }).max(100),
	description: z.string().trim().max(2000).optional(),
	startsAt: z.string().min(1, { error: "Start date is required." }),
	endsAt: z.string().optional(),
	location: z.string().trim().max(255).optional(),
	onlineUrl: z
		.string()
		.trim()
		.url({ error: "Must be a valid URL." })
		.max(255)
		.optional()
		.or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function EventsListSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			{[1, 2].map((i) => (
				<div
					key={i}
					className="rounded-lg border bg-card p-3 flex flex-col gap-1"
				>
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-3 w-32" />
				</div>
			))}
		</div>
	);
}

export function AdminEvents({ dictionary }: { dictionary: Dictionary }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const d = dictionary.events;
	const [showForm, setShowForm] = useState(false);

	const eventsQuery = useQuery(trpc.events.getEvents.queryOptions({ page: 1 }));

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			title: "",
			description: "",
			startsAt: "",
			endsAt: "",
			location: "",
			onlineUrl: "",
		},
	});

	const createMutation = useMutation(
		trpc.events.createEvent.mutationOptions({
			onSuccess: () => {
				toast.success(d.createSuccess);
				form.reset();
				setShowForm(false);
				queryClient.invalidateQueries({
					queryKey: trpc.events.getEvents.queryKey(),
				});
			},
			onError: (e) => toast.error(e.message ?? d.createError),
		}),
	);

	const onSubmit = (values: FormValues) => {
		createMutation.mutate({
			title: values.title,
			description: values.description || undefined,
			startsAt: new Date(values.startsAt),
			endsAt: values.endsAt ? new Date(values.endsAt) : undefined,
			location: values.location || undefined,
			onlineUrl: values.onlineUrl || undefined,
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-end">
				<Button
					size="sm"
					variant={showForm ? "outline" : "default"}
					onClick={() => {
						setShowForm((v) => !v);
						form.reset();
					}}
				>
					{showForm ? d.cancel : d.createEvent}
				</Button>
			</div>

			{showForm && (
				<div className="rounded-xl border bg-card p-4">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="flex flex-col gap-3"
						>
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{d.titleLabel}</FormLabel>
										<FormControl>
											<Input placeholder={d.titleLabel} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{d.description}</FormLabel>
										<FormControl>
											<Textarea
												rows={2}
												placeholder={d.description}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-3">
								<FormField
									control={form.control}
									name="startsAt"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{d.startsAt}</FormLabel>
											<FormControl>
												<Input type="datetime-local" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="endsAt"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{d.endsAt}</FormLabel>
											<FormControl>
												<Input type="datetime-local" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="location"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{d.location}</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Conference Room A" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="onlineUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{d.onlineEvent} URL</FormLabel>
										<FormControl>
											<Input
												placeholder="https://meet.google.com/…"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								size="sm"
								className="self-start"
								disabled={createMutation.isPending}
							>
								{createMutation.isPending ? (
									<Loader2 className="mr-1 size-3 animate-spin" />
								) : null}
								{d.createEvent}
							</Button>
						</form>
					</Form>
				</div>
			)}

			{eventsQuery.isLoading && <EventsListSkeleton />}

			{!eventsQuery.isLoading && eventsQuery.data?.length === 0 && (
				<p className="py-8 text-center text-sm text-muted-foreground">
					{d.noEvents}
				</p>
			)}

			{eventsQuery.data && eventsQuery.data.length > 0 && (
				<div className="flex flex-col gap-2">
					{eventsQuery.data.map((event) => (
						<div
							key={event.id}
							className="rounded-lg border bg-card p-3 flex flex-col gap-1"
						>
							<span className="font-medium">{event.title}</span>
							<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<Calendar className="size-3" />
									{new Date(event.startsAt).toLocaleString()}
								</span>
								{event.location && (
									<span className="flex items-center gap-1">
										<MapPin className="size-3" />
										{event.location}
									</span>
								)}
								{event.onlineUrl && (
									<span className="flex items-center gap-1">
										<Monitor className="size-3" />
										{d.onlineEvent}
									</span>
								)}
								<span>
									{event._count.rsvps} {d.going}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
