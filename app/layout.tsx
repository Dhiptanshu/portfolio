import type { Metadata } from "next";
import "./globals.css";
import { PortfolioAssistant } from "@/features/ai/portfolio-assistant";
import { AnalyticsTracker } from "@/features/analytics/tracker";
import { RecruiterProvider } from "@/features/recruiter/recruiter-context";
import { RecruiterButton } from "@/features/recruiter/recruiter-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dhiptanshu | Portfolio OS",
  description: "A dynamic developer portfolio powered by Supabase CMS content."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase!.from('ai_settings').select('is_chat_enabled').eq('id', 1).single();
  const isChatEnabled = settings?.is_chat_enabled ?? false;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <RecruiterProvider>
          <div className="noise" />
          <AnalyticsTracker />
          {children}
          {isChatEnabled && <PortfolioAssistant />}
          <RecruiterButton />
        </RecruiterProvider>
      </body>
    </html>
  );
}
