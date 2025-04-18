export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: string[];
  slug: string;
  coverImage: string;
  audioFile: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackFormData {
  title: string;
  artist: string;
  album: string;
  genres: string[];
  coverImage?: string;
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
