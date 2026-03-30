"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/auth/useAuth";
import { QueryError } from "@/components/query-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/dictionaries/useLocale";
import { supabase } from "@/lib/supabase";
import { useTRPC } from "@/trpc/trpc";

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function formatTime(date: Date | string) {
	return new Date(date).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatConversationDate(date: Date | string) {
	const d = new Date(date);
	const now = new Date();
	const isToday = d.toDateString() === now.toDateString();
	if (isToday) return formatTime(d);
	return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── sub-components ────────────────────────────────────────────────────────────

function ConversationListSkeleton() {
	return (
		<div className="flex flex-col gap-1 p-2">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex items-center gap-3 p-3">
					<Skeleton className="size-10 rounded-full shrink-0" />
					<div className="flex flex-col gap-1 flex-1 min-w-0">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-3 w-40" />
					</div>
				</div>
			))}
		</div>
	);
}

type Partner = { id: number; name: string; avatarUrl: string | null };

function ConversationItem({
	partner,
	lastMessage,
	lastMessageAt,
	lastMessageIsMine,
	unreadCount,
	isSelected,
	youLabel,
	onClick,
}: {
	partner: Partner;
	lastMessage: string;
	lastMessageAt: Date | string;
	lastMessageIsMine: boolean;
	unreadCount: number;
	isSelected: boolean;
	youLabel: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex items-center gap-3 p-3 rounded-lg w-full text-left hover:bg-accent transition-colors ${
				isSelected ? "bg-accent" : ""
			}`}
		>
			<Avatar className="size-10 shrink-0">
				<AvatarImage src={partner.avatarUrl ?? undefined} />
				<AvatarFallback>{getInitials(partner.name)}</AvatarFallback>
			</Avatar>
			<div className="flex flex-col min-w-0 flex-1 gap-0.5">
				<div className="flex items-center justify-between gap-2">
					<span className="font-medium text-sm truncate">{partner.name}</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{formatConversationDate(lastMessageAt)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2">
					<span className="text-xs text-muted-foreground truncate">
						{lastMessageIsMine ? `${youLabel}: ` : ""}
						{lastMessage}
					</span>
					{unreadCount > 0 && (
						<Badge className="h-5 min-w-5 px-1.5 text-xs shrink-0">
							{unreadCount}
						</Badge>
					)}
				</div>
			</div>
		</button>
	);
}

// ── main page ─────────────────────────────────────────────────────────────────

function MessagesContent() {
	const { dictionary } = useLocale();
	const d = dictionary.messages;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { currentUser } = useAuthStore();
	const searchParams = useSearchParams();
	const withParam = searchParams.get("with");
	const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(
		withParam ? Number(withParam) : null,
	);
	const [text, setText] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);

	// ── queries ──────────────────────────────────────────────────────────────

	const conversationsQuery = useQuery({
		...trpc.messages.getConversations.queryOptions(),
		refetchInterval: 10_000,
	});

	const selectedPartnerFromConversations = conversationsQuery.data?.find(
		(c) => c.partner.id === selectedPartnerId,
	)?.partner;

	// If opening a new conversation (?with=userId) and user not yet in conversations list,
	// fetch their info so we can show the chat header
	const newPartnerQuery = useQuery({
		...trpc.users.getPublicUserInfoById.queryOptions({
			id: selectedPartnerId ?? 0,
		}),
		enabled: selectedPartnerId !== null && !selectedPartnerFromConversations,
	});

	const selectedPartner =
		selectedPartnerFromConversations ??
		(newPartnerQuery.data
			? {
					id: newPartnerQuery.data.id,
					name: newPartnerQuery.data.name,
					avatarUrl: newPartnerQuery.data.avatarUrl ?? null,
				}
			: undefined);

	const messagesQuery = useQuery({
		...trpc.messages.getMessages.queryOptions({
			partnerId: selectedPartnerId ?? 0,
		}),
		refetchInterval: 3_000,
		enabled: selectedPartnerId !== null,
	});

	const markAsReadMutation = useMutation(
		trpc.messages.markConversationAsRead.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.messages.getConversations.queryKey(),
				});
				queryClient.invalidateQueries({
					queryKey: trpc.messages.getUnreadCount.queryKey(),
				});
			},
		}),
	);

	const sendMutation = useMutation(
		trpc.messages.sendMessage.mutationOptions({
			onSuccess: (newMsg) => {
				// Optimistically append to message list
				if (selectedPartnerId === null) return;
				queryClient.setQueryData(
					trpc.messages.getMessages.queryKey({ partnerId: selectedPartnerId }),
					(old: typeof messagesQuery.data) =>
						old ? [...old, newMsg] : [newMsg],
				);
				queryClient.invalidateQueries({
					queryKey: trpc.messages.getConversations.queryKey(),
				});
				setText("");
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	// ── realtime ─────────────────────────────────────────────────────────────

	useEffect(() => {
		if (!currentUser) return;

		const channel = supabase
			.channel(`dm:user:${currentUser.id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "direct_messages",
					filter: `receiver_id=eq.${currentUser.id}`,
				},
				(payload) => {
					const senderId = (payload.new as { sender_id: number }).sender_id;
					queryClient.invalidateQueries({
						queryKey: trpc.messages.getConversations.queryKey(),
					});
					queryClient.invalidateQueries({
						queryKey: trpc.messages.getUnreadCount.queryKey(),
					});
					if (selectedPartnerId === senderId) {
						queryClient.invalidateQueries({
							queryKey: trpc.messages.getMessages.queryKey({
								partnerId: senderId,
							}),
						});
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [currentUser, selectedPartnerId, queryClient, trpc]);

	// ── side effects ─────────────────────────────────────────────────────────

	// Mark as read when opening a conversation
	useEffect(() => {
		if (selectedPartnerId !== null) {
			markAsReadMutation.mutate({ partnerId: selectedPartnerId });
		}
	}, [selectedPartnerId, markAsReadMutation.mutate]);

	// Scroll to bottom when new messages arrive
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally depends on message data to trigger scroll
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messagesQuery.data]);

	// ── send handler ─────────────────────────────────────────────────────────

	const handleSend = () => {
		const content = text.trim();
		if (!content || !selectedPartnerId || sendMutation.isPending) return;
		sendMutation.mutate({ receiverId: selectedPartnerId, content });
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	// ── layout helpers ────────────────────────────────────────────────────────

	// On mobile, hide the list when a conversation is selected
	const showList = selectedPartnerId === null;

	return (
		<div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
			{/* ── Conversation list ── */}
			<div
				className={`${showList ? "flex" : "hidden"} md:flex flex-col w-full md:w-72 lg:w-80 border-r shrink-0`}
			>
				<div className="px-4 py-3 border-b">
					<h1 className="font-semibold">{d.title}</h1>
				</div>
				<ScrollArea className="flex-1">
					{conversationsQuery.isLoading ? (
						<ConversationListSkeleton />
					) : conversationsQuery.isError ? (
						<QueryError
							message={conversationsQuery.error.message}
							onRetry={() => conversationsQuery.refetch()}
						/>
					) : !conversationsQuery.data ||
						conversationsQuery.data.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
							<MessageSquare className="size-8 text-muted-foreground" />
							<p className="text-sm font-medium">{d.noConversations}</p>
							<p className="text-xs text-muted-foreground">
								{d.noConversationsHint}
							</p>
						</div>
					) : (
						<div className="flex flex-col gap-0.5 p-2">
							{conversationsQuery.data.map((conv) => (
								<ConversationItem
									key={conv.partner.id}
									partner={conv.partner}
									lastMessage={conv.lastMessage}
									lastMessageAt={conv.lastMessageAt}
									lastMessageIsMine={conv.lastMessageIsMine}
									unreadCount={conv.unreadCount}
									isSelected={selectedPartnerId === conv.partner.id}
									youLabel={d.you}
									onClick={() => setSelectedPartnerId(conv.partner.id)}
								/>
							))}
						</div>
					)}
				</ScrollArea>
			</div>

			{/* ── Chat window ── */}
			<div
				className={`${!showList ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}
			>
				{selectedPartnerId && selectedPartner ? (
					<>
						{/* Header */}
						<div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
								onClick={() => setSelectedPartnerId(null)}
							>
								<ArrowLeft className="size-4" />
							</Button>
							<Avatar className="size-8">
								<AvatarImage src={selectedPartner.avatarUrl ?? undefined} />
								<AvatarFallback>
									{getInitials(selectedPartner.name)}
								</AvatarFallback>
							</Avatar>
							<span className="font-semibold">{selectedPartner.name}</span>
						</div>

						{/* Messages */}
						<ScrollArea className="flex-1 p-4">
							{messagesQuery.isLoading ? (
								<div className="flex flex-col gap-2">
									{[1, 2, 3].map((i) => (
										<Skeleton
											key={i}
											className={`h-8 w-48 ${i % 2 === 0 ? "self-end" : "self-start"}`}
										/>
									))}
								</div>
							) : messagesQuery.isError ? (
								<QueryError
									message={messagesQuery.error.message}
									onRetry={() => messagesQuery.refetch()}
								/>
							) : !messagesQuery.data || messagesQuery.data.length === 0 ? (
								<p className="text-center text-sm text-muted-foreground py-8">
									{d.noMessages}
								</p>
							) : (
								<div className="flex flex-col gap-1">
									{messagesQuery.data.map((msg) => {
										const isOwn = msg.senderId === currentUser?.id;
										return (
											<div
												key={msg.id}
												className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
											>
												<div
													className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
														isOwn
															? "bg-primary text-primary-foreground rounded-br-sm"
															: "bg-muted rounded-bl-sm"
													}`}
												>
													<p className="wrap-break-words">{msg.content}</p>
													<p
														className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}
													>
														{formatTime(msg.createdAt)}
													</p>
												</div>
											</div>
										);
									})}
									<div ref={bottomRef} />
								</div>
							)}
						</ScrollArea>

						{/* Compose */}
						<div className="flex items-center gap-2 p-3 border-t shrink-0">
							<Input
								value={text}
								onChange={(e) => setText(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={d.messagePlaceholder}
								className="flex-1"
								disabled={sendMutation.isPending}
							/>
							<Button
								size="icon"
								onClick={handleSend}
								disabled={!text.trim() || sendMutation.isPending}
							>
								<Send className="size-4" />
							</Button>
						</div>
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center gap-2 text-center p-8">
						<MessageSquare className="size-10 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{d.selectConversation}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default function MessagesPage() {
	return (
		<Suspense
			fallback={
				<div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
					<div className="flex flex-col w-full md:w-72 lg:w-80 border-r shrink-0">
						<div className="px-4 py-3 border-b">
							<Skeleton className="h-5 w-24" />
						</div>
						<ConversationListSkeleton />
					</div>
				</div>
			}
		>
			<MessagesContent />
		</Suspense>
	);
}
