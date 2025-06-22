/// <reference types="vitest/globals" />
// @vitest-environment jsdom
import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import TrackItem from '@/components/tracks/TrackItem';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { TracksProvider } from '@/contexts/TracksContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockTrack = {
  id: '1',
  title: 'Test Track',
  artist: 'Test Artist',
  album: 'Test Album',
  genres: ['Rock', 'Alternative'],
  coverImage: 'https://example.com/cover.jpg',
  audioFile: 'https://example.com/audio.mp3',
};

const mockInitialTracks = {
  data: [mockTrack],
  meta: {
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient();
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

test('TrackItem renders track information', () => {
  const { getByText } = renderWithProviders(<TrackItem track={mockTrack} />);
  
  expect(getByText('Test Track')).toBeInTheDocument();
  expect(getByText('Test Artist')).toBeInTheDocument();
  expect(getByText('Test Album')).toBeInTheDocument();
  expect(getByText('Rock')).toBeInTheDocument();
  expect(getByText('Alternative')).toBeInTheDocument();
});

test('TrackItem displays cover image', () => {
  const { container } = renderWithProviders(<TrackItem track={mockTrack} />);
  const img = container.querySelector('img');
  expect(img).not.toBeNull();
  expect(img?.getAttribute('src')).toContain('cover.jpg');
});