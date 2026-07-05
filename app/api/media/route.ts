import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createServiceClient, createSupabaseServerClient } from "@/lib/supabase/server";

const bucket = "portfolio-media";

export async function POST(request: Request) {
  const form = await request.formData();
  if (form.get("_method") === "DELETE") {
    const id = String(form.get("id"));
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase.from("media_assets").select("file_path").eq("id", id).single();
      if (data) await supabase.storage.from(bucket).remove([data.file_path]);
      await supabase.from("media_assets").delete().eq("id", id);
    }
    redirect("/admin/media");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 422 });
  const supabase = createServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });

  const filePath = `${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  await supabase.from("media_assets").insert({
    file_name: file.name,
    file_path: filePath,
    public_url: urlData.publicUrl,
    mime_type: file.type,
    size_bytes: file.size,
    bucket
  });
  redirect("/admin/media");
}
