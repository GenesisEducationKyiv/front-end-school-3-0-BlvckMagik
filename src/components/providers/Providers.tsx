"use client";

import QueryProvider from "@/providers/QueryProvider";
import AudioPlayer from "@/components/tracks/AudioPlayer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <AudioPlayer />
    </QueryProvider>
  );
}
