import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TracksList from '@/components/tracks/TrackList';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { TracksProvider } from '@/contexts/TracksContext';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockInitialTracks = {
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TracksProvider initialTracks={mockInitialTracks}>
        <AudioPlayerProvider>
          {component}
        </AudioPlayerProvider>
      </TracksProvider>
    </QueryClientProvider>
  );
};

describe('Tracks Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Tracks List Integration', () => {
    it('should load and display tracks from API', async () => {
      const onCreateTrackClick = vi.fn();
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      expect(screen.getByTestId('loading-tracks')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Test Track 1')).toBeInTheDocument();
      expect(screen.getByText('Test Artist 1')).toBeInTheDocument();
      expect(screen.getByText('Test Track 2')).toBeInTheDocument();
      expect(screen.getByText('Test Artist 2')).toBeInTheDocument();
    });

    it('should handle search functionality', async () => {
      const onCreateTrackClick = vi.fn();
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      await user.type(searchInput, 'Test Track 1');

      await waitFor(() => {
        expect(screen.getByText('Test Track 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Track 2')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle genre filtering', async () => {
      const onCreateTrackClick = vi.fn();
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('filter-genre')).toBeInTheDocument();
      });

      server.use(
        http.get('/api/tracks', ({ request }) => {
          const url = new URL(request.url);
          const genre = url.searchParams.get('genre');
          
          if (genre === 'Rock') {
            return HttpResponse.json({
              data: [
                {
                  id: '1',
                  title: 'Test Track 1',
                  artist: 'Test Artist 1',
                  album: 'Test Album 1',
                  genres: ['Rock', 'Alternative'],
                  coverImage: 'https://example.com/cover1.jpg',
                  audioFile: 'https://example.com/audio1.mp3',
                },
              ],
              meta: {
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
              },
            });
          }
          
          return HttpResponse.json({
            data: [],
            meta: {
              total: 0,
              page: 1,
              limit: 10,
              totalPages: 0,
            },
          });
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Test Track 1')).toBeInTheDocument();
      });
    });

    it('should handle pagination', async () => {
      const onCreateTrackClick = vi.fn();
      
      server.use(
        http.get('/api/tracks', ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');
          
          if (page === 1) {
            return HttpResponse.json({
              data: [
                {
                  id: '1',
                  title: 'Track 1',
                  artist: 'Artist 1',
                  album: 'Album 1',
                  genres: ['Rock'],
                  coverImage: 'https://example.com/cover1.jpg',
                  audioFile: 'https://example.com/audio1.mp3',
                },
              ],
              meta: {
                total: 2,
                page: 1,
                limit: 1,
                totalPages: 2,
              },
            });
          }
          
          if (page === 2) {
            return HttpResponse.json({
              data: [
                {
                  id: '2',
                  title: 'Track 2',
                  artist: 'Artist 2',
                  album: 'Album 2',
                  genres: ['Pop'],
                  coverImage: 'https://example.com/cover2.jpg',
                  audioFile: 'https://example.com/audio2.mp3',
                },
              ],
              meta: {
                total: 2,
                page: 2,
                limit: 1,
                totalPages: 2,
              },
            });
          }
          
          return HttpResponse.json({
            data: [],
            meta: {
              total: 0,
              page: 1,
              limit: 1,
              totalPages: 0,
            },
          });
        })
      );
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByTestId('pagination')).toBeInTheDocument();
      });

      expect(screen.getByText('Track 1')).toBeInTheDocument();
      expect(screen.queryByText('Track 2')).not.toBeInTheDocument();

      const page2Button = screen.getByText('2');
      await user.click(page2Button);

      await waitFor(() => {
        expect(screen.getByText('Track 2')).toBeInTheDocument();
        expect(screen.queryByText('Track 1')).not.toBeInTheDocument();
      });
    });

    it('should handle sorting', async () => {
      const onCreateTrackClick = vi.fn();
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      const sortSelect = screen.getByTestId('sort-select');
      
      await user.click(sortSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Test Track 1')).toBeInTheDocument();
      });
    });

    it('should handle create track button click', async () => {
      const onCreateTrackClick = vi.fn();
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      const createButton = screen.getByTestId('create-track-button');
      await user.click(createButton);

      expect(onCreateTrackClick).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      const onCreateTrackClick = vi.fn();

      server.use(
        http.get('/api/tracks', () => {
          return HttpResponse.json(
            { error: 'Internal Server Error', message: 'Something went wrong' },
            { status: 500 }
          );
        })
      );
      
      renderWithQueryClient(
        <TracksList onCreateTrackClick={onCreateTrackClick} />
      );

      expect(screen.getByTestId('loading-tracks')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-tracks')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('create-track-button')).toBeInTheDocument();
    });
  });
}); 