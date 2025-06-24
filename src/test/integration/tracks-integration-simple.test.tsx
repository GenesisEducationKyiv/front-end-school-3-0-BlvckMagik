import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import TracksList from '@/components/tracks/TrackList';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { TracksProvider } from '@/contexts/TracksContext';
import { server } from '../mocks/server';

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

describe('Tracks Integration Tests - Simple', () => {
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
  });
}); 