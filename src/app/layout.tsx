import type { Metadata } from "next";
import "@/app/globals.css";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";

export const metadata: Metadata = {
  title: "Music App",
  description: "Application for managing music tracks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </body>
    </html>
  );
}
