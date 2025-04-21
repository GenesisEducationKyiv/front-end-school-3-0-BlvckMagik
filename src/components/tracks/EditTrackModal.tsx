"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Track, TrackFormData } from "@/types";
import { trackFormSchema } from "@/lib/validators";
import { uploadTrackFile } from "@/app/actions/tracks";
import { useTracks } from "@/contexts/TracksContext";
import { trackApi } from "@/lib/api";
import Select from "react-select";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { useQueryClient } from "@tanstack/react-query";

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
  const [genreOptions, setGenreOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const { updateTrack } = useTracks();
  const { currentTrack, stopPlayback } = useAudioPlayer();
  const queryClient = useQueryClient();
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

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await trackApi.getGenres();
        const genres = response.data;
        setGenreOptions(
          genres.map((genre: string) => ({
            value: genre,
            label: genre.charAt(0).toUpperCase() + genre.slice(1),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const validateAudioFile = (file: File | null): boolean => {
    if (!file) return true;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !["mp3", "wav"].includes(fileExtension || "")
    ) {
      setFileError("Будь ласка, завантажте аудіофайл у форматі MP3 або WAV");
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

  const onSubmit = async (data: TrackFormData) => {
    if (!validateAudioFile(selectedFile)) return;

    try {
      setIsSubmitting(true);

      if (currentTrack?.track.id === track.id) {
        stopPlayback();
      }

      const response = await trackApi.updateTrack(track.id, data);
      let updatedTrack = response.data;

      if (selectedFile) {
        updatedTrack = await uploadTrackFile(track.id, selectedFile);
      }

      updateTrack(updatedTrack);

      queryClient.invalidateQueries({ queryKey: ["tracks"] });

      onClose();
    } catch (error) {
      console.error("Failed to update track:", error);
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Track</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              {...register("title")}
              className="w-full border rounded p-2"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Artist</label>
            <input
              {...register("artist")}
              className="w-full border rounded p-2"
            />
            {errors.artist && (
              <p className="text-red-500 text-sm">{errors.artist.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Album</label>
            <input
              {...register("album")}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1">Cover Image (URL)</label>
            <input
              {...register("coverImage")}
              placeholder="Введіть URL обкладинки"
              className="w-full border rounded p-2"
            />
            {errors.coverImage && (
              <p className="text-red-500 text-sm">
                {errors.coverImage.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">Genres</label>
            <Select
              isMulti
              options={genreOptions}
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
              <p className="text-red-500 text-sm">{errors.genres.message}</p>
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
            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting || !!fileError}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
