import * as z from "zod";

export const trackFormSchema = z.object({
  title: z.string().min(1, "Track title is required"),
  artist: z.string().min(1, "Artist name is required"),
  album: z.string().optional(),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  coverImage: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

export type TrackFormValues = z.infer<typeof trackFormSchema>;
