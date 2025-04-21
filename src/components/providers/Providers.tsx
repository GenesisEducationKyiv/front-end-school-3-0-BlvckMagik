"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { TracksProvider } from "@/contexts/TracksContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TracksProvider
        initialTracks={{
          data: [],
          meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
        }}
      >
        <AudioPlayerProvider>{children}</AudioPlayerProvider>
      </TracksProvider>
    </QueryClientProvider>
  );
}
