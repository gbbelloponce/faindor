"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuthStore } from "@/auth/useAuth";
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
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/dictionaries/types";
import { useTRPC } from "@/trpc/trpc";

const schema = z.object({
	name: z.string().trim().min(1, { error: "Required" }).max(100),
	description: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function AdminOrgSettings({ dictionary }: { dictionary: Dictionary }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { currentUser, setCurrentUser } = useAuthStore();
	const d = dictionary.admin.orgSettings;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: currentUser?.organization.name ?? "",
			description: currentUser?.organization.description ?? "",
		},
	});

	const updateMutation = useMutation(
		trpc.admin.updateOrganization.mutationOptions({
			onSuccess: (updatedOrg) => {
				toast.success(d.updateSuccess);
				// Update the currentUser store so the header reflects the new name
				if (currentUser) {
					setCurrentUser({
						...currentUser,
						organization: {
							...currentUser.organization,
							...updatedOrg,
						},
					});
				}
				queryClient.invalidateQueries({
					queryKey: trpc.admin.getUsers.queryKey(),
				});
			},
			onError: (e) => toast.error(e.message ?? d.updateError),
		}),
	);

	const onSubmit = (values: FormValues) => {
		updateMutation.mutate(values);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4 max-w-md"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{d.name}</FormLabel>
							<FormControl>
								<Input placeholder={d.namePlaceholder} {...field} />
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
									placeholder={d.descriptionPlaceholder}
									rows={3}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="self-start"
					disabled={updateMutation.isPending}
				>
					{updateMutation.isPending ? (
						<Loader2 className="mr-2 size-4 animate-spin" />
					) : null}
					{d.save}
				</Button>
			</form>
		</Form>
	);
}
