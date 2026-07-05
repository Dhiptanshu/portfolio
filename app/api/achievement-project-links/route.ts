import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { achievementProjectLinkSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const parsed = achievementProjectLinkSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const { data, error } = await supabase.from("achievement_project_links").insert(parsed.data).select("*, entries(id, title, short_description, demo_url, github_url)").single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const { id, achievement_id, entry_id } = await request.json();
  let query = supabase.from("achievement_project_links").delete();
  if (id) query = query.eq("id", id);
  else query = query.eq("achievement_id", achievement_id).eq("entry_id", entry_id);
  const { error } = await query;
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
