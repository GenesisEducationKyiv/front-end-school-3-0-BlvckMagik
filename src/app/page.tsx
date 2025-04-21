import TrackList from "@/components/tracks/TrackList";
import Header from "@/components/layout/Header";

export default async function TracksPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TrackList />
      </main>
    </div>
  );
}
