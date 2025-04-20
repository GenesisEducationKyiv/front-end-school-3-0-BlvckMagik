import * as z from "zod";

export const trackFormSchema = z.object({
  title: z.string().min(1, "Назва треку обов'язкова"),
  artist: z.string().min(1, "Ім'я виконавця обов'язкове"),
  album: z.string().optional(),
  genres: z.array(z.string()).min(1, "Оберіть хоча б один жанр"),
  coverImage: z
    .string()
    .url("Невірний формат URL")
    .optional()
    .or(z.literal("")),
});

export type TrackFormValues = z.infer<typeof trackFormSchema>;
