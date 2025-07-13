import { z } from "zod";

export const nonEmptyStringSchema = z.string().min(1, "This field is required");
export const optionalStringSchema = z.string().optional();
export const urlSchema = z.string().url("Invalid URL format").optional().or(z.literal(""));

export const trackFormSchema = z.object({
  title: nonEmptyStringSchema.min(1, "Track title is required"),
  artist: nonEmptyStringSchema.min(1, "Artist name is required"),
  album: optionalStringSchema,
  genres: z.array(nonEmptyStringSchema).min(1, "Select at least one genre"),
  coverImage: urlSchema,
});

export const trackSchema = z.object({
  id: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  artist: nonEmptyStringSchema,
  album: optionalStringSchema,
  coverImage: optionalStringSchema,
  genres: z.array(nonEmptyStringSchema),
  audioFile: optionalStringSchema,
});

export const createTrackDtoSchema = trackFormSchema;

export const paginationMetaSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
  data: z.ZodArray<T>;
  meta: typeof paginationMetaSchema;
}> =>
  z.object({
    data: z.array(dataSchema),
    meta: paginationMetaSchema,
  });

export const trackQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sort: optionalStringSchema,
  order: z.enum(["asc", "desc"]).optional(),
  search: optionalStringSchema,
  genre: optionalStringSchema,
  artist: optionalStringSchema,
});

export const apiErrorSchema = z.object({
  error: nonEmptyStringSchema,
  message: optionalStringSchema,
  statusCode: z.number().int().optional(),
});

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
  data: T;
  success: z.ZodLiteral<true>;
}> =>
  z.object({
    data: dataSchema,
    success: z.literal(true),
  });

export const audioPlayerTrackSchema = z.object({
  id: nonEmptyStringSchema,
  title: nonEmptyStringSchema,
  artist: nonEmptyStringSchema,
  coverImage: nonEmptyStringSchema,
});

export const audioPlayerStateSchema = z.object({
  audioUrl: nonEmptyStringSchema,
  track: audioPlayerTrackSchema,
});

export const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url("Invalid API URL"),
});

export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: "Please select a valid file" }),
  maxSize: z.number().int().positive().default(50 * 1024 * 1024), // 50MB
  allowedTypes: z.array(z.string()).default(["audio/mpeg", "audio/wav", "audio/ogg"]),
});

export type TrackFormValues = z.infer<typeof trackFormSchema>;
export type TrackFormData = z.infer<typeof trackFormSchema>;
export type Track = z.infer<typeof trackSchema>;
export type CreateTrackDto = z.infer<typeof createTrackDtoSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
export type TrackQueryParams = z.infer<typeof trackQueryParamsSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type AudioPlayerTrack = z.infer<typeof audioPlayerTrackSchema>;
export type AudioPlayerState = z.infer<typeof audioPlayerStateSchema>;

export function parseTrack(data: unknown): Track {
  return trackSchema.parse(data);
}

export function parsePaginatedTracks(data: unknown): PaginatedResponse<Track> {
  return paginatedResponseSchema(trackSchema).parse(data);
}

export function parseTrackQueryParams(data: unknown): TrackQueryParams {
  return trackQueryParamsSchema.parse(data);
}

export function parseApiError(data: unknown): ApiError {
  return apiErrorSchema.parse(data);
}

export function safeParseTrack(data: unknown): { success: true; data: Track } | { success: false; error: z.ZodError } {
  const result = trackSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function safeParsePaginatedTracks(data: unknown): 
  | { success: true; data: PaginatedResponse<Track> } 
  | { success: false; error: z.ZodError } {
  const result = paginatedResponseSchema(trackSchema).safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
