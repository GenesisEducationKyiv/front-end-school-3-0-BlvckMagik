"use client";

import { useState } from "react";
import CreateTrackModal from "@/components/tracks/CreateTrackModal";
import TracksList from "@/components/tracks/TrackList";
import ActiveTrackDisplay from "@/components/ActiveTrackDisplay";

export default function TracksPage(): React.JSX.Element {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8 pb-[160px]">
      <h1 className="text-3xl font-bold mb-8" data-testid="tracks-header">
        Tracks
      </h1>

      {/* Active Track Display */}
      <div className="mb-8">
        <ActiveTrackDisplay />
      </div>

      <TracksList onCreateTrackClick={() => setIsCreateModalOpen(true)} />

      <CreateTrackModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </main>
  );
}
