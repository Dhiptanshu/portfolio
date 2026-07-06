import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().max(100).optional(),
  role: z.string().min(2, "Role is required").max(100),
  region: z.string().min(2, "Region is required").max(100),
  subject: z.string().min(2, "Subject is required").max(150),
  message: z.string().min(10, "Message must be at least 10 characters"),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  attachment_url: z.string().url().optional(),
  turnstileToken: z.string().optional(),
});

const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT = 5; // max 5 requests
const WINDOW_MS = 60 * 60 * 1000; // per hour

export async function POST(request: Request) {
  try {
    // Basic IP Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip);
    
    if (rateData) {
      if (now - rateData.timestamp < WINDOW_MS) {
        if (rateData.count >= RATE_LIMIT) {
          return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }
        rateData.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }
    
    const formData = await request.formData();
    
    const body = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string || undefined,
      role: formData.get("role") as string,
      region: formData.get("region") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      linkedin: formData.get("linkedin") as string || undefined,
      turnstileToken: formData.get("turnstileToken") as string || undefined,
    };

    // Validate with Zod
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Handle file upload
    const file = formData.get("attachment") as File | null;
    let attachment_url = undefined;

    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
         return NextResponse.json({ error: "File must be smaller than 5MB" }, { status: 400 });
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("contact-attachments")
        .upload(fileName, file);
        
      if (uploadError) {
        return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
      }
      
      const { data: urlData } = supabase.storage.from("contact-attachments").getPublicUrl(fileName);
      attachment_url = urlData.publicUrl;
    }

    // Extract turnstileToken out before inserting
    const { turnstileToken, ...insertData } = parsed.data;

    // Insert into DB
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({ ...insertData, attachment_url })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optional: Send Email Notification via Resend/SendGrid
    // fetch("https://api.resend.com/emails", { ... })

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
