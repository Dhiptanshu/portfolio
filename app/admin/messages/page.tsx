import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MessagesAdmin } from "@/features/admin/messages-admin";

export default async function AdminMessagesPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your contact form submissions and CRM data.</p>
      </div>
      <MessagesAdmin initialMessages={data || []} />
    </div>
  );
}
