import { NextResponse } from "next/server";
import { createServiceClient, createSupabaseServerClient } from "@/lib/supabase/server";

const bucket = "portfolio-media";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 422 });

  const supabase = createServiceClient() ?? (await createSupabaseServerClient());
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });

  const filePath = `journeys/${crypto.randomUUID()}-${file.name}`;
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

  return NextResponse.json({ url: urlData.publicUrl, mime_type: file.type, file_name: file.name });
}
