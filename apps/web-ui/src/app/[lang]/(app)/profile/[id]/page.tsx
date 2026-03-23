"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, Pencil } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useAuth } from "@/auth/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/dictionaries/useLocale";
import { uploadToStorage } from "@/lib/upload";
import { useTRPC } from "@/trpc/trpc";
import { PostCard } from "../../home/post-card";

const editProfileSchema = z.object({
	name: z.string().min(1, { error: "Name is required" }).max(100).trim(),
	bio: z.string().max(300).trim().optional(),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function ProfileHeaderSkeleton() {
	return (
		<div className="rounded-xl border bg-card p-6 flex items-center gap-5">
			<Skeleton className="size-16 rounded-full" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-6 w-40" />
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
	);
}

function PostFeedSkeleton() {
	return (
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
	);
}

export default function ProfilePage() {
	const { dictionary } = useLocale();
	const params = useParams();
	const userId = Number(params.id);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { currentUser } = useAuth();
	const router = useRouter();
	const { locale } = useLocale();

	const isOwnProfile = currentUser?.id === userId;

	const [isEditing, setIsEditing] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const MAX_AVATAR_SIZE_MB = 2;
	const ACCEPTED_IMAGE_TYPES = [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
	];

	const applyAvatarFile = (file: File) => {
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			toast.error(
				"Only JPEG, PNG, WebP, or GIF images are accepted for profile pictures.",
			);
			return;
		}
		if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
			toast.error(`Image must be smaller than ${MAX_AVATAR_SIZE_MB} MB.`);
			return;
		}
		setAvatarFile(file);
		setAvatarPreview(URL.createObjectURL(file));
	};

	const userQuery = useQuery(
		trpc.users.getPublicUserInfoById.queryOptions({ id: userId }),
	);

	const postsQuery = useQuery(
		trpc.posts.getLatestsPostsByUserId.queryOptions({ userId, page: 1 }),
	);

	const savedPostsQuery = useQuery({
		...trpc.posts.getSavedPosts.queryOptions({ page: 1 }),
		enabled: isOwnProfile,
	});

	const updateProfileMutation = useMutation(
		trpc.users.updateProfile.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.users.getPublicUserInfoById.queryKey({ id: userId }),
				});
				toast.success(dictionary.profile.updateSuccess);
				setIsEditing(false);
				setAvatarFile(null);
				setAvatarPreview(null);
			},
			onError: () => {
				toast.error(dictionary.profile.updateError);
			},
		}),
	);

	const user = userQuery.data;

	const form = useForm<EditProfileValues>({
		resolver: zodResolver(editProfileSchema),
		defaultValues: {
			name: user?.name ?? "",
			bio: user?.bio ?? "",
		},
	});

	const handleEditClick = () => {
		form.reset({
			name: user?.name ?? "",
			bio: user?.bio ?? "",
		});
		setAvatarFile(null);
		setAvatarPreview(null);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setAvatarFile(null);
		setAvatarPreview(null);
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) applyAvatarFile(file);
		e.target.value = "";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => setIsDragging(false);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) applyAvatarFile(file);
	};

	const onSubmit = async (values: EditProfileValues) => {
		let avatarUrl: string | null | undefined = undefined;

		if (avatarFile) {
			try {
				avatarUrl = await uploadToStorage(avatarFile, "avatars");
			} catch {
				toast.error(dictionary.profile.updateError);
				return;
			}
		}

		updateProfileMutation.mutate({
			name: values.name,
			bio: values.bio || undefined,
			...(avatarUrl !== undefined ? { avatarUrl } : {}),
		});
	};

	const displayAvatarUrl = avatarPreview ?? user?.avatarUrl ?? null;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
			{userQuery.isLoading ? (
				<ProfileHeaderSkeleton />
			) : user ? (
				<div className="rounded-xl border bg-card p-6">
					{isEditing ? (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="flex flex-col gap-4"
							>
								<div className="flex items-start gap-5">
									<button
										type="button"
										aria-label={dictionary.profile.avatarLabel}
										className="relative shrink-0 group"
										onClick={() => fileInputRef.current?.click()}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
									>
										<Avatar
											className={`size-16 transition-opacity ${isDragging ? "opacity-60" : ""}`}
										>
											{displayAvatarUrl && (
												<AvatarImage src={displayAvatarUrl} alt={user.name} />
											)}
											<AvatarFallback className="text-xl">
												{getInitials(user.name)}
											</AvatarFallback>
										</Avatar>
										<div
											className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
										>
											<Pencil className="size-4 text-white" />
										</div>
									</button>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/jpeg,image/png,image/webp,image/gif"
										className="hidden"
										onChange={handleAvatarChange}
									/>
									<div className="flex-1 flex flex-col gap-3">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{dictionary.auth.common.firstName}
													</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder={dictionary.profile.namePlaceholder}
															disabled={updateProfileMutation.isPending}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="bio"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{dictionary.profile.bio}</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															placeholder={dictionary.profile.bioPlaceholder}
															rows={3}
															disabled={updateProfileMutation.isPending}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={handleCancel}
										disabled={updateProfileMutation.isPending}
									>
										{dictionary.profile.cancel}
									</Button>
									<Button
										type="submit"
										disabled={updateProfileMutation.isPending}
									>
										{updateProfileMutation.isPending ? (
											<Loader2 className="animate-spin" />
										) : (
											dictionary.profile.saveChanges
										)}
									</Button>
								</div>
							</form>
						</Form>
					) : (
						<div className="flex items-start gap-5">
							<Avatar className="size-16 shrink-0">
								{user.avatarUrl && (
									<AvatarImage src={user.avatarUrl} alt={user.name} />
								)}
								<AvatarFallback className="text-xl">
									{getInitials(user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3 flex-wrap">
									<h1 className="text-xl font-bold">{user.name}</h1>
									{isOwnProfile ? (
										<Button
											size="sm"
											variant="outline"
											onClick={handleEditClick}
										>
											{dictionary.profile.editProfile}
										</Button>
									) : (
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												router.push(`/${locale}/messages?with=${userId}`)
											}
										>
											<MessageSquare className="size-3.5 mr-1" />
											{dictionary.profile.message}
										</Button>
									)}
								</div>
								<p className="text-sm text-muted-foreground">{user.email}</p>
								<p className="text-xs text-muted-foreground mt-0.5">
									{user.organization.name}
								</p>
								{user.bio && <p className="text-sm mt-2">{user.bio}</p>}
							</div>
						</div>
					)}
				</div>
			) : null}

			{isOwnProfile ? (
				<Tabs defaultValue="posts">
					<TabsList>
						<TabsTrigger value="posts">{dictionary.profile.posts}</TabsTrigger>
						<TabsTrigger value="saved">
							{dictionary.profile.savedPosts}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="posts" className="mt-4">
						{postsQuery.isLoading && <PostFeedSkeleton />}
						{!postsQuery.isLoading && postsQuery.data?.length === 0 && (
							<p className="py-8 text-center text-sm text-muted-foreground">
								{dictionary.profile.noPosts}
							</p>
						)}
						{postsQuery.data && postsQuery.data.length > 0 && (
							<div className="flex flex-col gap-4">
								{postsQuery.data.map((post) => (
									<PostCard key={post.id} post={post} />
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="saved" className="mt-4">
						{savedPostsQuery.isLoading && <PostFeedSkeleton />}
						{!savedPostsQuery.isLoading &&
							savedPostsQuery.data?.length === 0 && (
								<p className="py-8 text-center text-sm text-muted-foreground">
									{dictionary.profile.noSavedPosts}
								</p>
							)}
						{savedPostsQuery.data && savedPostsQuery.data.length > 0 && (
							<div className="flex flex-col gap-4">
								{savedPostsQuery.data.map((post) => (
									<PostCard key={post.id} post={post} />
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			) : (
				<>
					<h2 className="font-semibold">{dictionary.profile.posts}</h2>

					{postsQuery.isLoading && <PostFeedSkeleton />}

					{!postsQuery.isLoading && postsQuery.data?.length === 0 && (
						<p className="py-8 text-center text-sm text-muted-foreground">
							{dictionary.profile.noPosts}
						</p>
					)}

					{postsQuery.data && postsQuery.data.length > 0 && (
						<div className="flex flex-col gap-4">
							{postsQuery.data.map((post) => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
