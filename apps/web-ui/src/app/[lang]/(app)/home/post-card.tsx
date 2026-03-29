"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/dictionaries/useLocale";
import { useTRPC } from "@/trpc/trpc";
import { cn } from "@/utils";
import type { RouterOutputs } from "api";

type PostCardProps = {
	post: RouterOutputs["posts"]["getPostById"];
};

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getRelativeTime(date: Date | string, locale: string): string {
	const now = new Date();
	const d = new Date(date);
	const diffMs = now.getTime() - d.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	const rtf = new Intl.RelativeTimeFormat(locale, {
		numeric: "auto",
		style: "narrow",
	});

	if (diffSeconds < 60) return rtf.format(-diffSeconds, "second");
	if (diffMinutes < 60) return rtf.format(-diffMinutes, "minute");
	if (diffHours < 24) return rtf.format(-diffHours, "hour");
	if (diffDays < 30) return rtf.format(-diffDays, "day");
	return d.toLocaleDateString(locale);
}

export function PostCard({ post }: PostCardProps) {
	const { dictionary, locale } = useLocale();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [liked, setLiked] = useState(post.isLikedByUser);
	const [likesCount, setLikesCount] = useState(post._count.likes);
	const [saved, setSaved] = useState(post.isSavedByUser);
	const [commentsCount, setCommentsCount] = useState(post._count.comments);
	const [showComments, setShowComments] = useState(false);
	const [commentText, setCommentText] = useState("");

	const {
		data: commentsData,
		isLoading: commentsLoading,
		refetch: refetchComments,
	} = useQuery({
		...trpc.comments.getPostComments.queryOptions({ postId: post.id, page: 1 }),
		enabled: showComments,
	});

	const createLikeMutation = useMutation(
		trpc.likes.createLike.mutationOptions({
			onError: () => {
				setLiked(false);
				setLikesCount((c) => c - 1);
			},
		}),
	);

	const deleteLikeMutation = useMutation(
		trpc.likes.deleteLike.mutationOptions({
			onError: () => {
				setLiked(true);
				setLikesCount((c) => c + 1);
			},
		}),
	);

	const createCommentMutation = useMutation(
		trpc.comments.createComment.mutationOptions({
			onError: () => {
				toast.error(dictionary.home.post.commentError);
			},
		}),
	);

	const savePostMutation = useMutation(
		trpc.posts.savePostById.mutationOptions({
			onError: () => setSaved(false),
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: trpc.posts.getSavedPosts.queryKey({ page: 1 }),
				}),
		}),
	);

	const unsavePostMutation = useMutation(
		trpc.posts.unsavePostById.mutationOptions({
			onError: () => setSaved(true),
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: trpc.posts.getSavedPosts.queryKey({ page: 1 }),
				}),
		}),
	);

	const handleSave = () => {
		if (saved) {
			setSaved(false);
			unsavePostMutation.mutate({ postId: post.id });
		} else {
			setSaved(true);
			savePostMutation.mutate({ postId: post.id });
		}
	};

	const handleLike = () => {
		if (liked) {
			setLiked(false);
			setLikesCount((c) => c - 1);
			deleteLikeMutation.mutate({ postId: post.id });
		} else {
			setLiked(true);
			setLikesCount((c) => c + 1);
			createLikeMutation.mutate({ postId: post.id });
		}
	};

	const handleSubmitComment = () => {
		if (!commentText.trim()) return;
		createCommentMutation.mutate(
			{ postId: post.id, content: commentText },
			{
				onSuccess: () => {
					setCommentText("");
					setCommentsCount((c) => c + 1);
					refetchComments();
				},
			},
		);
	};

	return (
		<div className="rounded-xl border bg-card p-4">
			<div className="flex items-center gap-3">
				<Avatar>
					<AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
				</Avatar>
				<div className="flex items-center gap-2">
					<Link
						href={`/${locale}/profile/${post.author.id}`}
						className="text-sm font-semibold hover:underline"
					>
						{post.author.name}
					</Link>
					<span className="text-xs text-muted-foreground">
						{getRelativeTime(post.createdAt, locale)}
					</span>
				</div>
			</div>

			<p className="mt-3 text-sm whitespace-pre-wrap">{post.content}</p>

			{post.imageUrl && (
				<div className="mt-3">
					<Image
						src={post.imageUrl}
						alt="Post image"
						width={600}
						height={400}
						className="rounded-lg object-cover w-full max-h-96"
					/>
				</div>
			)}

			<div className="mt-3 flex items-center gap-4">
				<button
					type="button"
					onClick={handleLike}
					className={cn(
						"flex items-center gap-1.5 text-xs transition-colors",
						liked ? "text-red-500" : "text-muted-foreground hover:text-red-500",
					)}
				>
					<Heart className={cn("size-4", liked && "fill-current")} />
					<span>
						{likesCount} {dictionary.home.post.likes}
					</span>
				</button>

				<button
					type="button"
					onClick={() => setShowComments((v) => !v)}
					className={cn(
						"flex items-center gap-1.5 text-xs transition-colors",
						showComments
							? "text-foreground"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<MessageCircle className="size-4" />
					<span>
						{commentsCount} {dictionary.home.post.comments}
					</span>
				</button>

				<button
					type="button"
					onClick={handleSave}
					className={cn(
						"ml-auto flex items-center gap-1.5 text-xs transition-colors",
						saved ? "text-primary" : "text-muted-foreground hover:text-primary",
					)}
				>
					<Bookmark className={cn("size-4", saved && "fill-current")} />
				</button>
			</div>

			{showComments && (
				<div className="mt-4 border-t pt-4 space-y-3">
					<div className="flex gap-2">
						<Textarea
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							placeholder={dictionary.home.post.commentPlaceholder}
							className="min-h-0 h-9 resize-none py-2 text-sm"
							rows={1}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmitComment();
								}
							}}
						/>
						<Button
							size="icon"
							variant="ghost"
							className="size-9 shrink-0"
							onClick={handleSubmitComment}
							disabled={!commentText.trim() || createCommentMutation.isPending}
						>
							<Send className="size-4" />
						</Button>
					</div>

					{commentsLoading && (
						<div className="flex flex-col gap-3">
							{[1, 2].map((i) => (
								<div key={i} className="flex gap-2">
									<Skeleton className="size-7 rounded-full shrink-0" />
									<div className="flex flex-col gap-1.5 flex-1">
										<Skeleton className="h-2.5 w-20" />
										<Skeleton className="h-2.5 w-full" />
									</div>
								</div>
							))}
						</div>
					)}

					{!commentsLoading && commentsData?.length === 0 && (
						<p className="text-xs text-muted-foreground text-center py-2">
							{dictionary.home.post.noComments}
						</p>
					)}

					<div className="space-y-3">
						{commentsData?.map((comment) => (
							<div key={comment.id} className="flex gap-2">
								<Avatar className="size-7 shrink-0">
									<AvatarFallback className="text-xs">
										{getInitials(comment.author.name)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="flex items-center gap-1.5">
										<span className="text-xs font-semibold">
											{comment.author.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{getRelativeTime(comment.createdAt, locale)}
										</span>
									</div>
									<p className="text-xs mt-0.5 whitespace-pre-wrap">
										{comment.content}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
