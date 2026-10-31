import TurneraPageClient from "../TurneraPageClient";

export default async function TenantTurneraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TurneraPageClient slug={slug} />;
}
