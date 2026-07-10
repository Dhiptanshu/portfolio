import type { Metadata } from "next";
import { Bungee, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CustomCursor } from "@/components/custom-cursor";
import { PageLoader } from "@/components/page-loader";

const bungee = Bungee({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dhiptanshu Malik — Engineer & Builder",
  description:
    "Portfolio of Dhiptanshu Malik — full-stack engineer, hackathon finalist, and builder of intelligent systems.",
  openGraph: {
    title: "Dhiptanshu Malik — Engineer & Builder",
    description:
      "Portfolio of Dhiptanshu Malik — full-stack engineer, hackathon finalist, and builder of intelligent systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bungee.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-mono antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CustomCursor />
          <PageLoader>
            {children}
          </PageLoader>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
