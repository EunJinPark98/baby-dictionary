import { notFound } from "next/navigation";
import { AdminEditor } from "@/components/admin/admin-editor";
import { getAdminConfig } from "@/lib/admin/config";
import { adminTable } from "@/lib/admin/db";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEditPage({ params }: PageProps<"/admin/[type]/[id]">) {
  const { type, id } = await params;
  const config = getAdminConfig(type);
  if (!config || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await adminTable(supabase, config.table).select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <AdminEditor config={config} row={data as Record<string, unknown>} />;
}
