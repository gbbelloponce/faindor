"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
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
import { uploadToStorage } from "@/lib/upload";
import { useTRPC } from "@/trpc/trpc";

const MAX_POST_IMAGE_MB = 5;
const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
];

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

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { content: "" },
	});

	const createPost = useMutation(
		trpc.posts.createPost.mutationOptions({
			onSuccess: () => {
				form.reset();
				setImageFile(null);
				setImagePreview(null);
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
				toast.error(dictionary.home.createPost.createError);
			},
		}),
	);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) applyImageFile(file);
		e.target.value = "";
	};

	const handleDragOver = (e: React.DragEvent) => e.preventDefault();

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file) applyImageFile(file);
	};

	const applyImageFile = (file: File) => {
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			toast.error(dictionary.home.createPost.imageInvalidType);
			return;
		}
		if (file.size > MAX_POST_IMAGE_MB * 1024 * 1024) {
			toast.error(dictionary.home.createPost.imageTooBig);
			return;
		}
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview(null);
	};

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		let imageUrl: string | null = null;

		if (imageFile) {
			try {
				imageUrl = await uploadToStorage(imageFile, "post-images");
			} catch {
				toast.error(dictionary.home.createPost.uploadError);
				return;
			}
		}

		createPost.mutate({ content: data.content, groupId, imageUrl });
	};

	return (
		<div
			className="rounded-xl border bg-card p-4"
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
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

						{imagePreview && (
							<div className="relative w-fit">
								<Image
									src={imagePreview}
									alt="Post image preview"
									width={320}
									height={200}
									className="rounded-lg object-cover max-h-48 w-auto"
								/>
								<button
									type="button"
									aria-label={dictionary.home.createPost.removeImage}
									onClick={removeImage}
									className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-foreground text-background"
								>
									<X className="size-3" />
								</button>
							</div>
						)}

						<div className="flex items-center justify-between">
							<button
								type="button"
								aria-label={dictionary.home.createPost.attachImage}
								onClick={() => fileInputRef.current?.click()}
								className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
								disabled={createPost.isPending}
							>
								<ImageIcon className="size-4" />
								<span>{dictionary.home.createPost.attachImage}</span>
							</button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/jpeg,image/png,image/webp,image/gif"
								className="hidden"
								onChange={handleImageChange}
							/>
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
