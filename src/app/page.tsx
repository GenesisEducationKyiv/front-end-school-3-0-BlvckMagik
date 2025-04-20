import { getTracks } from "@/app/actions/tracks";
import TrackList from "@/components/tracks/TrackList";
import Header from "@/components/layout/Header";
import { TracksProvider } from "@/contexts/TracksContext";

export default async function TracksPage() {
  const initialTracks = await getTracks();

  return (
    <div className="min-h-screen">
      <Header />
      <TracksProvider initialTracks={initialTracks}>
        <main className="container mx-auto px-4 py-8">
          <TrackList initialTracks={initialTracks} />
        </main>
      </TracksProvider>
    </div>
  );
}
