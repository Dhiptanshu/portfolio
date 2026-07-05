import type { Metadata } from "next";
import "./globals.css";
import { PortfolioAssistant } from "@/features/ai/portfolio-assistant";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dhiptanshu | Portfolio OS",
  description: "A dynamic developer portfolio powered by Supabase CMS content."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('ai_settings').select('is_chat_enabled').eq('id', 1).single();
  const isChatEnabled = settings?.is_chat_enabled ?? false; // Default to false if missing

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <div className="noise" />
        {children}
        {isChatEnabled && <PortfolioAssistant />}
      </body>
    </html>
  );
}
