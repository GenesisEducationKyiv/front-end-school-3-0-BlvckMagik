"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrackFormData } from "@/types";
import { trackFormSchema } from "@/lib/validators";
import { uploadTrackFile } from "@/app/actions/tracks";
import { useTracks } from "@/contexts/TracksContext";
import { trackApi } from "@/lib/api";
import Select from "react-select";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTrackModal({
  isOpen,
  onClose,
}: CreateTrackModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genreOptions, setGenreOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const { addTrack } = useTracks();
  const queryClient = useQueryClient();

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

  const onSubmit = async (data: TrackFormData) => {
    if (!validateAudioFile(selectedFile)) return;

    try {
      setIsSubmitting(true);

      const response = await trackApi.createTrack(data);
      const newTrack = response.data;

      if (selectedFile) {
        const updatedTrack = await uploadTrackFile(newTrack.id, selectedFile);
        addTrack(updatedTrack);
      } else {
        addTrack(newTrack);
      }

      queryClient.invalidateQueries({ queryKey: ["tracks"] });

      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create track:", error);
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Створити новий трек</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Назва</label>
            <input
              {...register("title")}
              className="w-full border rounded p-2"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Виконавець</label>
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting || !!fileError}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
