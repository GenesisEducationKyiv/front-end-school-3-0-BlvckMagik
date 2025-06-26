import axios, { type AxiosResponse, type AxiosError } from "axios";
import { type Result, ok, err } from "neverthrow";
import {
  type Track,
  type CreateTrackDto,
  type TrackFormData,
  type TrackQueryParams,
  type PaginatedResponse,
  type ApiError,
  parseApiError,
  safeParsePaginatedTracks,
  safeParseTrack,
} from "@/lib/validators";
import { isAxiosError, assertExists } from "@/lib/type-guards";

const ENDPOINTS = {
  TRACKS: "/tracks",
  GENRES: "/genres",
  TRACKS_BY_ID: (id: string) => `/tracks/${id}`,
  UPLOAD_FILE: (id: string) => `/tracks/${id}/upload`,
  DELETE_FILE: (id: string) => `/tracks/${id}/file`,
  FILES: (fileName: string) => `/files/${fileName}`,
} as const;

export interface NetworkError {
  type: "network";
  message: string;
  originalError: unknown;
}

export interface ValidationError {
  type: "validation";
  message: string;
  details: string[];
}

export interface ApiClientApiError {
  type: "api";
  error: ApiError;
}

export interface UnknownError {
  type: "unknown";
  message: string;
}

export type ApiClientError = NetworkError | ValidationError | ApiClientApiError | UnknownError;

export type ApiResult<T> = Result<T, ApiClientError>;

export const api = axios.create({
  baseURL: `${process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:3000"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

function handleApiError(error: unknown): ApiClientError {
  if (isAxiosError(error)) {
    if (error.response?.data !== null && error.response?.data !== undefined) {
      try {
        const parseResult = parseApiError(error.response.data);
        return {
          type: "api",
          error: parseResult,
        };
      } catch {
        //
      }
    }
    
    return {
      type: "network",
      message: error.message || "Network error occurred",
      originalError: error,
    };
  }

  return {
    type: "unknown",
    message: error instanceof Error ? error.message : "Unknown error occurred",
  };
}


async function safeApiCall<T>(
  apiCall: () => Promise<AxiosResponse<T>>
): Promise<ApiResult<T>> {
  try {
    const response = await apiCall();
    return ok(response.data);
  } catch (error) {
    return err(handleApiError(error));
  }
}

export const trackApiClient = {
  async getTracks(params: TrackQueryParams): Promise<ApiResult<PaginatedResponse<Track>>> {
    const result = await safeApiCall(() => 
      api.get<unknown>(ENDPOINTS.TRACKS, { params })
    );

    return result.andThen((data) => {
      const parseResult = safeParsePaginatedTracks(data);
      if (parseResult.success) {
        return ok(parseResult.data);
      }
      
      return err({
        type: "validation" as const,
        message: "Invalid response format",
        details: parseResult.error.issues.map(issue => issue.message),
      });
    });
  },

  async createTrack(data: CreateTrackDto): Promise<ApiResult<Track>> {
    const result = await safeApiCall(() => 
      api.post<unknown>(ENDPOINTS.TRACKS, data)
    );

    return result.andThen((responseData) => {
      const parseResult = safeParseTrack(responseData);
      if (parseResult.success) {
        return ok(parseResult.data);
      }
      
      return err({
        type: "validation" as const,
        message: "Invalid track data received",
        details: parseResult.error.issues.map(issue => issue.message),
      });
    });
  },

  async updateTrack(id: string, data: TrackFormData): Promise<ApiResult<Track>> {
    assertExists(id, "Track ID is required for update");
    
    const result = await safeApiCall(() => 
      api.put<unknown>(ENDPOINTS.TRACKS_BY_ID(id), data)
    );

    return result.andThen((responseData) => {
      const parseResult = safeParseTrack(responseData);
      if (parseResult.success) {
        return ok(parseResult.data);
      }
      
      return err({
        type: "validation" as const,
        message: "Invalid updated track data received",
        details: parseResult.error.issues.map(issue => issue.message),
      });
    });
  },

  async deleteTrack(id: string): Promise<ApiResult<void>> {
    assertExists(id, "Track ID is required for deletion");
    
    const trackResult = await safeApiCall(() => 
      api.get<unknown>(ENDPOINTS.TRACKS_BY_ID(id))
    );

    if (trackResult.isErr()) {
      return err(trackResult.error);
    }

    const parseResult = safeParseTrack(trackResult.value);
    if (parseResult.success) {
      const track = parseResult.data;
      
      if (track.audioFile !== undefined && track.audioFile !== "") {
        const deleteFileResult = await safeApiCall(() => 
          api.delete(ENDPOINTS.DELETE_FILE(id))
        );
        
        if (deleteFileResult.isErr()) {
          console.warn("Failed to delete audio file, proceeding with track deletion");
        }
      }
    }

    const deleteResult = await safeApiCall(() => 
      api.delete(ENDPOINTS.TRACKS_BY_ID(id))
    );

    return deleteResult.map(() => undefined);
  },

  async uploadFile(id: string, file: File): Promise<ApiResult<{ audioFile: string }>> {
    assertExists(id, "Track ID is required for file upload");
    assertExists(file, "File is required for upload");

    const formData = new FormData();
    formData.append("audioFile", file);

    const result = await safeApiCall(() => 
      api.post<{ audioFile: string }>(ENDPOINTS.UPLOAD_FILE(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        maxBodyLength: Infinity,
      })
    );

    return result;
  },

  async getAudioFile(fileName: string): Promise<ApiResult<string>> {
    assertExists(fileName, "File name is required");

    const result = await safeApiCall(() => 
      api.get(ENDPOINTS.FILES(fileName), {
        responseType: "blob",
      })
    );

    return result.map((blob) => URL.createObjectURL(blob as Blob));
  },

  async getGenres(): Promise<ApiResult<string[]>> {
    const result = await safeApiCall(() => 
      api.get<string[]>(ENDPOINTS.GENRES)
    );

    return result;
  },
};

export function getErrorMessage(error: ApiClientError): string {
  switch (error.type) {
    case "network":
      return `Network error: ${error.message}`;
    case "validation":
      return `Validation error: ${error.message}. Details: ${error.details.join(", ")}`;
    case "api":
      return error.error.message ?? error.error.error;
    case "unknown":
      return `Unknown error: ${error.message}`;
  }
}

export function isRetryableError(error: ApiClientError): boolean {
  return error.type === "network";
}

export function isValidationError(error: ApiClientError): error is ValidationError {
  return error.type === "validation";
}

export function isApiError(error: ApiClientError): error is ApiClientApiError {
  return error.type === "api";
} 