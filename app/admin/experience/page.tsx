import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExperienceAdmin } from "@/features/admin/experience-admin";

export default async function ExperienceAdminPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: experiences } = await supabase.from("experiences").select("*").order("display_order");
  return <ExperienceAdmin initialExperiences={experiences ?? []} />;
}
