export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverImage?: string;
  genres: string[];
  audioFile?: string;
}

export interface CreateTrackDto {
  title: string;
  artist: string;
  album?: string;
  coverImage?: string;
  genres: string[];
}

export interface TrackFormData {
  title: string;
  artist: string;
  album?: string;
  coverImage?: string;
  genres: string[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TrackQueryParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  genre?: string;
  artist?: string;
}
