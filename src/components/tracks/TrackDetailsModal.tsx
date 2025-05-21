import Image from "next/image";
import { Track } from "@/types";
interface TrackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

export default function TrackDetailsModal({
  isOpen,
  onClose,
  track,
}: TrackDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Track Details</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={track.coverImage || "/default-cover.webp"}
              alt={track.title}
              width={96}
              height={96}
              className="w-24 h-24 rounded object-cover"
            />
            <div>
              <h3 className="font-semibold">{track.title}</h3>
              <p className="text-gray-400">{track.artist}</p>
              {track.album && (
                <p className="text-gray-500 text-sm">{track.album}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Genres:</h4>
            <div className="flex flex-wrap gap-2">
              {track.genres.map((genre) => (
                <span
                  key={genre}
                  className="bg-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
