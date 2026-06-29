import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "PlatypusHire — ATS-Friendly Resume Builder",
  description:
    "Build beautiful, ATS-compliant resumes with real-time preview. Client-side, serverless, and completely free.",
  keywords: [
    "resume builder",
    "ATS friendly",
    "resume",
    "PlatypusHire",
    "PDF resume",
  ],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Cg stroke='%23171717' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 36c0-10.5 8.2-19 18.5-19 6.3 0 11.7 3.2 14.8 8'/%3E%3Cpath d='M11 36c3.5 6.7 10 11 18.5 11 6.3 0 11.7-2.8 15.2-7.5'/%3E%3Cpath d='M11 36c-4 0-6.5 3-6.5 6s2.7 5.2 6.5 5.2c3.2 0 5.5-2.2 5.5-5.2'/%3E%3Cpath d='M44 25l4-1.5'/%3E%3Cpath d='M48 23.5c3-1.6 6.3-2.1 9-1.2 3 .9 4.5 3.1 3.7 5.8-.8 2.8-3.4 4.1-6.7 3.9-2.6-.2-5.2-1.2-7.1-2.6'/%3E%3Cpath d='M40 47c-.8 3.1.8 6.1 3.8 7.3'/%3E%3Cpath d='M21 47c-1.5 3.2-.8 6.3 2.1 8'/%3E%3C/g%3E%3Ccircle cx='29' cy='24' r='2.3' fill='%23171717'/%3E%3Ccircle cx='55' cy='27' r='1.2' fill='%23171717'/%3E%3C/svg%3E",
    shortcut: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Cg stroke='%23171717' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 36c0-10.5 8.2-19 18.5-19 6.3 0 11.7 3.2 14.8 8'/%3E%3Cpath d='M11 36c3.5 6.7 10 11 18.5 11 6.3 0 11.7-2.8 15.2-7.5'/%3E%3Cpath d='M11 36c-4 0-6.5 3-6.5 6s2.7 5.2 6.5 5.2c3.2 0 5.5-2.2 5.5-5.2'/%3E%3Cpath d='M44 25l4-1.5'/%3E%3Cpath d='M48 23.5c3-1.6 6.3-2.1 9-1.2 3 .9 4.5 3.1 3.7 5.8-.8 2.8-3.4 4.1-6.7 3.9-2.6-.2-5.2-1.2-7.1-2.6'/%3E%3Cpath d='M40 47c-.8 3.1.8 6.1 3.8 7.3'/%3E%3Cpath d='M21 47c-1.5 3.2-.8 6.3 2.1 8'/%3E%3C/g%3E%3Ccircle cx='29' cy='24' r='2.3' fill='%23171717'/%3E%3Ccircle cx='55' cy='27' r='1.2' fill='%23171717'/%3E%3C/svg%3E",
    apple: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Cg stroke='%23171717' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 36c0-10.5 8.2-19 18.5-19 6.3 0 11.7 3.2 14.8 8'/%3E%3Cpath d='M11 36c3.5 6.7 10 11 18.5 11 6.3 0 11.7-2.8 15.2-7.5'/%3E%3Cpath d='M11 36c-4 0-6.5 3-6.5 6s2.7 5.2 6.5 5.2c3.2 0 5.5-2.2 5.5-5.2'/%3E%3Cpath d='M44 25l4-1.5'/%3E%3Cpath d='M48 23.5c3-1.6 6.3-2.1 9-1.2 3 .9 4.5 3.1 3.7 5.8-.8 2.8-3.4 4.1-6.7 3.9-2.6-.2-5.2-1.2-7.1-2.6'/%3E%3Cpath d='M40 47c-.8 3.1.8 6.1 3.8 7.3'/%3E%3Cpath d='M21 47c-1.5 3.2-.8 6.3 2.1 8'/%3E%3C/g%3E%3Ccircle cx='29' cy='24' r='2.3' fill='%23171717'/%3E%3Ccircle cx='55' cy='27' r='1.2' fill='%23171717'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground"
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
