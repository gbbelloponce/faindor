import { redirect } from "next/navigation";

export default async function Root({
	params,
}: { params: Promise<{ lang: string }> }) {
	const { lang } = await params;
	redirect(`/${lang}/home`);
}
