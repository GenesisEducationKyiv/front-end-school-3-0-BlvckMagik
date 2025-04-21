"use client";

import { useState } from "react";
import CreateTrackModal from "@/components/tracks/CreateTrackModal";
import TracksList from "@/components/tracks/TrackList";

export default function TracksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Треки</h1>

      <TracksList onCreateTrackClick={() => setIsCreateModalOpen(true)} />

      <CreateTrackModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
