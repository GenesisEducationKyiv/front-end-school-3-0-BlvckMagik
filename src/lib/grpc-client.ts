// gRPC Web Client using HTTP proxy
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000';

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

export interface GetTracksRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  search?: string;
  genre?: string;
  artist?: string;
}

export interface GetTracksResponse {
  data: Track[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTrackRequest {
  title: string;
  artist: string;
  album: string;
  genres: string[];
  coverImage: string;
}

export interface UpdateTrackRequest {
  id: string;
  title: string;
  artist: string;
  album: string;
  genres: string[];
  coverImage: string;
}

export interface DeleteTracksRequest {
  ids: string[];
}

export interface DeleteTracksResponse {
  success: string[];
  failed: string[];
}

export interface ActiveTrackUpdate {
  trackTitle: string;
  artist: string;
  timestamp: string;
}

export interface ConnectedMessage {
  type: 'connected';
  message: string;
}

export type SSEMessage = ActiveTrackUpdate | ConnectedMessage;

class GrpcWebClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Track methods
  async getAllTracks(request: GetTracksRequest = {}): Promise<GetTracksResponse> {
    const params = new URLSearchParams();
    if (request.page) params.append('page', request.page.toString());
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.sort) params.append('sort', request.sort);
    if (request.order) params.append('order', request.order);
    if (request.search) params.append('search', request.search);
    if (request.genre) params.append('genre', request.genre);
    if (request.artist) params.append('artist', request.artist);

    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to get tracks: ${response.statusText}`);
    }
    return response.json() as Promise<GetTracksResponse>;
  }

  async getTrack(slug: string): Promise<{ track: Track }> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks/${slug}`);
    if (!response.ok) {
      throw new Error(`Failed to get track: ${response.statusText}`);
    }
    return response.json() as Promise<{ track: Track }>;
  }

  async createTrack(request: CreateTrackRequest): Promise<{ track: Track }> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to create track: ${response.statusText}`);
    }
    return response.json() as Promise<{ track: Track }>;
  }

  async updateTrack(id: string, request: UpdateTrackRequest): Promise<{ track: Track }> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to update track: ${response.statusText}`);
    }
    return response.json() as Promise<{ track: Track }>;
  }

  async deleteTrack(id: string): Promise<void> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete track: ${response.statusText}`);
    }
  }

  async deleteTracks(request: DeleteTracksRequest): Promise<DeleteTracksResponse> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete tracks: ${response.statusText}`);
    }
    return response.json() as Promise<DeleteTracksResponse>;
  }

  async deleteTrackFile(id: string): Promise<{ track: Track }> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/tracks/${id}/file`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete track file: ${response.statusText}`);
    }
    return response.json() as Promise<{ track: Track }>;
  }

  // Genre methods
  async getGenres(): Promise<{ genres: string[] }> {
    const response = await globalThis.fetch(`${this.baseUrl}/api/grpc/genres`);
    if (!response.ok) {
      throw new Error(`Failed to get genres: ${response.statusText}`);
    }
    return response.json() as Promise<{ genres: string[] }>;
  }

  // Real-time streaming
  subscribeToActiveTrack(callback: (update: ActiveTrackUpdate) => void): () => void {
    // Створюємо EventSource без credentials для уникнення CORS проблем
    const eventSource = new EventSource(`${this.baseUrl}/api/grpc/stream/active-track`);
    
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = event.data as string;
        console.log('Received SSE data:', data);
        
        // Парсимо JSON дані
        const update = JSON.parse(data) as SSEMessage;
        
        // Перевіряємо, чи це не повідомлення про підключення
        if ('type' in update && update.type === 'connected') {
          console.log('SSE stream connected');
          return;
        }
        
        // Перевіряємо, чи це оновлення активного треку
        if ('trackTitle' in update && 'artist' in update) {
          callback(update as ActiveTrackUpdate);
        }
      } catch (error) {
        console.error('Failed to parse active track update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      console.log('EventSource readyState:', eventSource.readyState);
      
      // Try to reconnect after 5 seconds
      globalThis.setTimeout(() => {
        console.log('Attempting to reconnect SSE...');
      }, 5000);
    };

    // Return unsubscribe function
    return () => {
      console.log('Closing SSE connection');
      eventSource.close();
    };
  }
}

// Export singleton instance
export const grpcClient = new GrpcWebClient(); 