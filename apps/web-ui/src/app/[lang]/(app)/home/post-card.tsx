"use client";

import { Heart, MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocale } from "@/dictionaries/useLocale";

type PostCardProps = {
	post: {
		id: number;
		content: string;
		createdAt: string;
		author: {
			id: number;
			name: string;
		};
		_count: {
			likes: number;
			comments: number;
		};
	};
};

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function getRelativeTime(dateStr: string): string {
	const now = new Date();
	const date = new Date(dateStr);
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.floor(diffMs / 1000);
	const diffMinutes = Math.floor(diffSeconds / 60);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSeconds < 60) return "just now";
	if (diffMinutes < 60) return `${diffMinutes}m`;
	if (diffHours < 24) return `${diffHours}h`;
	if (diffDays < 30) return `${diffDays}d`;
	return date.toLocaleDateString();
}

export function PostCard({ post }: PostCardProps) {
	const { dictionary } = useLocale();

	return (
		<div className="rounded-xl border bg-card p-4">
			<div className="flex items-center gap-3">
				<Avatar>
					<AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
				</Avatar>
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold">{post.author.name}</span>
					<span className="text-xs text-muted-foreground">
						{getRelativeTime(post.createdAt)}
					</span>
				</div>
			</div>

			<p className="mt-3 text-sm whitespace-pre-wrap">{post.content}</p>

			<div className="mt-3 flex items-center gap-4 text-muted-foreground">
				<div className="flex items-center gap-1.5 text-xs">
					<Heart className="size-4" />
					<span>
						{post._count.likes} {dictionary.home.post.likes}
					</span>
				</div>
				<div className="flex items-center gap-1.5 text-xs">
					<MessageCircle className="size-4" />
					<span>
						{post._count.comments} {dictionary.home.post.comments}
					</span>
				</div>
			</div>
		</div>
	);
}
