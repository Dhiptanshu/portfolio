import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json();
  const { data, error } = await supabase.from("experiences").insert(body).select("*").single();
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new NextResponse("Unauthorized", { status: 401 });
  const { id, ...body } = await req.json();
  const { data, error } = await supabase.from("experiences").update(body).eq("id", id).select("*").single();
  if (error) return new NextResponse(error.message, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) return new NextResponse(error.message, { status: 500 });
  return new NextResponse("OK");
}
