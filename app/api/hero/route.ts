import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase.from("blocks").select("*").eq("type", "hero").single();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Check if hero block exists
  const { data: existing } = await supabase.from("blocks").select("id").eq("type", "hero").single();

  if (existing) {
    const { data, error } = await supabase
      .from("blocks")
      .update({ content: body })
      .eq("type", "hero")
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } else {
    // find home page id
    const { data: page } = await supabase.from("pages").select("id").eq("slug", "home").single();
    if (!page) return NextResponse.json({ error: "Home page not found" }, { status: 500 });

    const { data, error } = await supabase
      .from("blocks")
      .insert({ page_id: page.id, type: "hero", content: body, sort_order: 1 })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
}
