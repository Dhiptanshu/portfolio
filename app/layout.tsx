import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dhiptanshu | Portfolio OS",
  description: "A dynamic developer portfolio powered by Supabase CMS content."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <div className="noise" />
        {children}
      </body>
    </html>
  );
}
