"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Track, type TrackFormData, trackFormSchema } from "@/lib/validators";
import { trackApiClient, getErrorMessage } from "@/lib/api-client";
import { useTracks } from "@/contexts/TracksContext";
import Select from "react-select";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useQueryClient } from "@tanstack/react-query";
import { useGenres } from "@/lib/hooks/useGenres";

interface EditTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

export default function EditTrackModal({
  isOpen,
  onClose,
  track,
}: EditTrackModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateTrack } = useTracks();
  const { currentTrack, stopPlayback } = useAudioPlayer();
  const queryClient = useQueryClient();
  const { data: genreOptions = [], isLoading: genresLoading } = useGenres();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: track.title,
      artist: track.artist,
      album: track.album,
      genres: track.genres,
      coverImage: track.coverImage || "",
    },
  });



  const validateAudioFile = (file: File | null): boolean => {
    if (!file) return true;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !["mp3", "wav"].includes(fileExtension || "")
    ) {
      setFileError("Please upload an audio file in MP3 or WAV format");
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    validateAudioFile(file);
  };

  const onSubmit = async (data: TrackFormData): Promise<void> => {
    if (!validateAudioFile(selectedFile)) return;

    setIsSubmitting(true);

    if (currentTrack?.track.id === track.id) {
      stopPlayback();
    }

    const updateResult = await trackApiClient.updateTrack(track.id, data);
    
    if (updateResult.isErr()) {
      console.error("Failed to update track:", getErrorMessage(updateResult.error));
      window.location.reload();
      setIsSubmitting(false);
      return;
    }

    let updatedTrack = updateResult.value;

    if (selectedFile) {
      const uploadResult = await trackApiClient.uploadFile(track.id, selectedFile);
      
      if (uploadResult.isErr()) {
        console.error("Failed to upload file:", getErrorMessage(uploadResult.error));
        setIsSubmitting(false);
        return;
      }
      
      const refreshResult = await trackApiClient.getTracks({ page: 1, limit: 1 });
      if (refreshResult.isOk()) {
        const refreshedTrack = refreshResult.value.data.find(t => t.id === track.id);
        if (refreshedTrack) {
          updatedTrack = refreshedTrack;
        }
      }
    }

    updateTrack(updatedTrack);
    void queryClient.invalidateQueries({ queryKey: ["tracks"] });
    onClose();
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Track</h2>

        <form
          data-testid="track-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1">Title</label>
            <input
              data-testid="input-title"
              {...register("title")}
              className="w-full border rounded p-2"
            />
            {errors.title && (
              <p data-testid="error-title" className="text-red-500 text-sm">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">Artist</label>
            <input
              data-testid="input-artist"
              {...register("artist")}
              className="w-full border rounded p-2"
            />
            {errors.artist && (
              <p data-testid="error-artist" className="text-red-500 text-sm">
                {errors.artist.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">Album</label>
            <input
              data-testid="input-album"
              {...register("album")}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1">Cover Image (URL)</label>
            <input
              data-testid="input-cover-image"
              {...register("coverImage")}
              placeholder="Enter the URL of the cover image"
              className="w-full border rounded p-2"
            />
            {errors.coverImage && (
              <p
                data-testid="error-cover-image"
                className="text-red-500 text-sm"
              >
                {errors.coverImage.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">Genres</label>
            <Select
              data-testid="genre-selector"
              isMulti
              options={genreOptions}
              isLoading={genresLoading}
              defaultValue={track.genres.map((genre) => ({
                value: genre,
                label: genre.charAt(0).toUpperCase() + genre.slice(1),
              }))}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOptions) => {
                const values = selectedOptions.map((option) => option.value);
                setValue("genres", values);
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "white",
                }),
              }}
            />
            {errors.genres && (
              <p data-testid="error-genre" className="text-red-500 text-sm">
                {errors.genres.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">Audio File</label>
            <input
              type="file"
              accept="audio/mpeg,audio/wav,.mp3,.wav"
              onChange={handleFileChange}
              className="w-full border rounded p-2"
            />
            {fileError && (
              <p
                data-testid="error-audio-file"
                className="text-red-500 text-sm"
              >
                {fileError}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              data-testid="submit-button"
              type="submit"
              disabled={isSubmitting || !!fileError}
              aria-disabled={isSubmitting || !!fileError}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {isSubmitting ? (
                <span data-testid="loading-indicator">Saving...</span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
