import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { journeyMediaSchema, reorderSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json([]);
  const journeyId = new URL(request.url).searchParams.get("journey_id");
  let query = supabase.from("journey_media").select("*").order("display_order");
  if (journeyId) query = query.eq("journey_id", journeyId);
  const { data, error } = await query;
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const parsed = journeyMediaSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const { data, error } = await supabase.from("journey_media").insert(parsed.data).select("*").single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const body = await request.json();

  if (body.ids) {
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    const results = await Promise.all(parsed.data.ids.map((id, display_order) => supabase.from("journey_media").update({ display_order }).eq("id", id)));
    const error = results.find((result) => result.error)?.error;
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
  }

  const parsed = journeyMediaSchema.partial().safeParse(body);
  if (!body.id || !parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  const { data, error } = await supabase.from("journey_media").update(parsed.data).eq("id", body.id).select("*").single();
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  const { id } = await request.json();
  const { error } = await supabase.from("journey_media").delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
