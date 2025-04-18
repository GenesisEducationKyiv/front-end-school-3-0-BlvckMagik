import { getTracks } from "@/app/actions/tracks";
import TrackList from "@/components/tracks/TrackList";

export default async function TracksPage() {
  const tracks = await getTracks();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Музична бібліотека</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TrackList initialTracks={tracks} />
      </main>
    </div>
  );
}
