"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale } from "@/dictionaries/useLocale";
import { AdminContent } from "./admin-content";
import { AdminEvents } from "./admin-events";
import { AdminOrgSettings } from "./admin-org-settings";
import { AdminUsers } from "./admin-users";

export default function AdminPage() {
	const { dictionary } = useLocale();
	const d = dictionary.admin;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
			<h1 className="text-xl font-bold">{d.title}</h1>

			<Tabs defaultValue="users">
				<TabsList className="w-full">
					<TabsTrigger value="users" className="flex-1">
						{d.tabs.users}
					</TabsTrigger>
					<TabsTrigger value="org" className="flex-1">
						{d.tabs.orgSettings}
					</TabsTrigger>
					<TabsTrigger value="events" className="flex-1">
						{d.tabs.events}
					</TabsTrigger>
					<TabsTrigger value="content" className="flex-1">
						{d.tabs.content}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="mt-4">
					<AdminUsers dictionary={dictionary} />
				</TabsContent>

				<TabsContent value="org" className="mt-4">
					<AdminOrgSettings dictionary={dictionary} />
				</TabsContent>

				<TabsContent value="events" className="mt-4">
					<AdminEvents dictionary={dictionary} />
				</TabsContent>

				<TabsContent value="content" className="mt-4">
					<AdminContent dictionary={dictionary} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
