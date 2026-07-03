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
