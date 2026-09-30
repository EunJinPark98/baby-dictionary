import { notFound } from "next/navigation";
import { AdminEditor } from "@/components/admin/admin-editor";
import { getAdminConfig } from "@/lib/admin/config";

export default async function AdminNewPage({ params }: PageProps<"/admin/[type]/new">) {
  const { type } = await params;
  const config = getAdminConfig(type);
  if (!config) notFound();
  return <AdminEditor config={config} row={null} />;
}
