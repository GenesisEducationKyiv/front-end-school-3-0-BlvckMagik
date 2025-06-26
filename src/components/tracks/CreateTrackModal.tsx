"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type TrackFormData, trackFormSchema } from "@/lib/validators";
import { useCreateTrack, useUploadAudioFile, useGenres } from "@/hooks/useTracks";
import Select from "react-select";

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTrackModal({
  isOpen,
  onClose,
}: CreateTrackModalProps): React.JSX.Element | null {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const createTrackMutation = useCreateTrack();
  const uploadAudioFileMutation = useUploadAudioFile();
  const { data: genreOptions = [], isLoading: genresLoading } = useGenres();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: "",
      artist: "",
      album: "",
      genres: [],
      coverImage: "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    void validateAudioFile(file);
  };

  const onSubmit = async (data: TrackFormData): Promise<void> => {
    if (!validateAudioFile(selectedFile)) return;

    setSubmitError(null);

    try {
      const newTrack = await createTrackMutation.mutateAsync(data);

      if (selectedFile) {
        await uploadAudioFileMutation.mutateAsync({ id: newTrack.id, file: selectedFile });
      }

      reset();
      setSelectedFile(null);
      setSubmitError(null);
      onClose();
    } catch (error) {
      console.error("Failed to create track:", error);
      setSubmitError(`Failed to create track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create new track</h2>

        <form
          data-testid="track-form"
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
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
              className="basic-multi-select bg-transparent"
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

          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

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
              disabled={createTrackMutation.isPending || uploadAudioFileMutation.isPending || !!fileError}
              aria-disabled={createTrackMutation.isPending || uploadAudioFileMutation.isPending || !!fileError}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {createTrackMutation.isPending || uploadAudioFileMutation.isPending ? (
                <span data-testid="loading-indicator">Creating...</span>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
