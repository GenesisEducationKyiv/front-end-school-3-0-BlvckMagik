"use client";

import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TracksProvider } from "@/contexts/TracksContext";
import { AudioPlayerProvider } from "@/contexts/AudioPlayerContext";
import { AudioContextProvider } from "@/contexts/AudioContextProvider";
import { PageSpinner } from "@/components/ui";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<PageSpinner />}>
        <AudioContextProvider>
          <TracksProvider
            initialTracks={{
              data: [],
              meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
            }}
          >
            <AudioPlayerProvider>{children}</AudioPlayerProvider>
          </TracksProvider>
        </AudioContextProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
