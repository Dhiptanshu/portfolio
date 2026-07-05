import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { skillRelationshipSchema } from "@/lib/validations";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json([]);
  const { data, error } = await supabase.from("skill_relationships").select("*");
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const parsed = skillRelationshipSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const { data, error } = await supabase.from("skill_relationships").insert(parsed.data).select("*").single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const { id, parent_skill_id, child_skill_id } = await request.json();
  let query = supabase.from("skill_relationships").delete();
  if (id) query = query.eq("id", id);
  else query = query.eq("parent_skill_id", parent_skill_id).eq("child_skill_id", child_skill_id);
  const { error } = await query;
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
