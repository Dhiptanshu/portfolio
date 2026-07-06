import type { Metadata } from "next";
import "./globals.css";
import { PortfolioAssistant } from "@/features/ai/portfolio-assistant";
import { AnalyticsTracker } from "@/features/analytics/tracker";
import { RecruiterProvider } from "@/features/recruiter/recruiter-context";
import { RecruiterButton } from "@/features/recruiter/recruiter-button";
import { ThemeProvider } from "@/features/theme/theme-context";
import { ThemeSwitcher } from "@/features/theme/theme-switcher";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { initializeCmsRegistry } from "@/features/cms/registry-init";

initializeCmsRegistry();

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
        <ThemeProvider>
          <RecruiterProvider>
            <div className="noise" />
            <AnalyticsTracker />
            {children}
            {isChatEnabled && <PortfolioAssistant />}
            <div className="fixed top-6 right-6 z-50">
              <ThemeSwitcher />
            </div>
            <RecruiterButton />
          </RecruiterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
