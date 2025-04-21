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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genreOptions, setGenreOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const { updateTrack } = useTracks();

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

  const onSubmit = async (data: TrackFormData) => {
    try {
      setIsSubmitting(true);

      const formData = {
        ...data,
        coverImage: data.coverImage || "",
      };

      const response = await trackApi.updateTrack(track.id, formData);
      const updatedTrack = response.data;

      if (selectedFile) {
        const trackWithAudio = await uploadTrackFile(track.id, selectedFile);
        updateTrack(trackWithAudio);
      } else {
        updateTrack(updatedTrack);
      }

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
        <h2 className="text-xl font-bold mb-4">Редагувати трек</h2>

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
            <label className="block mb-1">Альбом</label>
            <input
              {...register("album")}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block mb-1">Обкладинка (URL)</label>
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
            <label className="block mb-1">Жанри</label>
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
            <label className="block mb-1">Аудіо файл</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={isSubmitting}
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Збереження..." : "Зберегти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
