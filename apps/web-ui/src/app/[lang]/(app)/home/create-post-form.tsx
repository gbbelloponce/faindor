"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/auth/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";

const formSchema = z.object({
	content: z
		.string()
		.min(1, { error: "Post content cannot be empty" })
		.max(5000, { error: "Post content is too long" }),
});

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

type CreatePostFormProps = {
	groupId?: number;
};

export function CreatePostForm({ groupId }: CreatePostFormProps = {}) {
	const { dictionary } = useLocale();
	const { currentUser } = useAuth();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			content: "",
		},
	});

	const createPost = useMutation(
		trpc.posts.createPost.mutationOptions({
			onSuccess: () => {
				form.reset();
				if (groupId) {
					queryClient.invalidateQueries({
						queryKey: trpc.posts.getLatestsPostsByGroupId.queryKey(),
					});
				} else {
					queryClient.invalidateQueries({
						queryKey: trpc.posts.getLatestsPosts.queryKey(),
					});
				}
			},
			onError: () => {
				toast.error("Failed to create post");
			},
		}),
	);

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		createPost.mutate({ content: data.content, groupId });
	};

	return (
		<div className="rounded-xl border bg-card p-4">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
					<Avatar>
						<AvatarFallback>
							{currentUser ? getInitials(currentUser.name) : "?"}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-1 flex-col gap-3">
						<FormField
							control={form.control}
							name="content"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											placeholder={dictionary.home.createPost.placeholder}
											className="resize-none border-0 p-0 shadow-none focus-visible:ring-0"
											disabled={createPost.isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end">
							<Button type="submit" size="sm" disabled={createPost.isPending}>
								{createPost.isPending ? (
									<Loader2 className="animate-spin" />
								) : (
									dictionary.home.createPost.button
								)}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
