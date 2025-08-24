import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { Toaster } from "@/components/ui/sonner";
import ClientPromptWatcher from "@/components/client-prompt-watcher";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LLM Agent Template Hub",
  description: "Discover and manage your collection of AI prompts, templates, and agent configurations for building intelligent applications.",
  keywords: ["AI", "LLM", "prompts", "templates", "agents", "artificial intelligence"],
  authors: [{ name: "Prompt Hub" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SmoothScrollProvider>
            <div className="relative min-h-screen overflow-x-hidden">
              {children}
              <ClientPromptWatcher />
              <Toaster position="top-right" />
            </div>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
