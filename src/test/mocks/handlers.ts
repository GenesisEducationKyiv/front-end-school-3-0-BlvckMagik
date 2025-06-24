import { http, HttpResponse } from 'msw';
import { type Track, type PaginatedResponse } from '@/lib/validators';

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Test Track 1',
    artist: 'Test Artist 1',
    album: 'Test Album 1',
    genres: ['Rock', 'Alternative'],
    coverImage: 'https://example.com/cover1.jpg',
    audioFile: 'https://example.com/audio1.mp3',
  },
  {
    id: '2',
    title: 'Test Track 2',
    artist: 'Test Artist 2',
    album: 'Test Album 2',
    genres: ['Pop', 'Electronic'],
    coverImage: 'https://example.com/cover2.jpg',
    audioFile: 'https://example.com/audio2.mp3',
  },
];

const mockGenres = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Alternative', 'Classical'];

export const handlers = [
  // GET /api/tracks
  http.get('/api/tracks', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const genre = url.searchParams.get('genre') || '';

    let filteredTracks = [...mockTracks];

    if (search) {
      filteredTracks = filteredTracks.filter(
        track =>
          track.title.toLowerCase().includes(search.toLowerCase()) ||
          track.artist.toLowerCase().includes(search.toLowerCase()) ||
          track.album?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (genre) {
      filteredTracks = filteredTracks.filter(track =>
        track.genres.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTracks = filteredTracks.slice(startIndex, endIndex);

    const response: PaginatedResponse<Track> = {
      data: paginatedTracks,
      meta: {
        total: filteredTracks.length,
        page,
        limit,
        totalPages: Math.ceil(filteredTracks.length / limit),
      },
    };

    return HttpResponse.json(response);
  }),

  // POST /api/tracks
  http.post('/api/tracks', async ({ request }) => {
    const body = await request.json();
    const newTrack: Track = {
      id: Date.now().toString(),
      title: body.title,
      artist: body.artist,
      album: body.album || '',
      genres: body.genres,
      coverImage: body.coverImage || '',
      audioFile: '',
    };

    mockTracks.push(newTrack);
    return HttpResponse.json(newTrack, { status: 201 });
  }),

  // GET /api/genres
  http.get('/api/genres', () => {
    return HttpResponse.json(mockGenres);
  }),

  // GET /api/tracks/:id
  http.get('/api/tracks/:id', ({ params }) => {
    const track = mockTracks.find(t => t.id === params.id);
    
    if (!track) {
      return HttpResponse.json(
        { error: 'Track not found', message: 'Track with this ID does not exist' },
        { status: 404 }
      );
    }

    return HttpResponse.json(track);
  }),

  // PUT /api/tracks/:id
  http.put('/api/tracks/:id', async ({ params, request }) => {
    const body = await request.json();
    const trackIndex = mockTracks.findIndex(t => t.id === params.id);
    
    if (trackIndex === -1) {
      return HttpResponse.json(
        { error: 'Track not found', message: 'Track with this ID does not exist' },
        { status: 404 }
      );
    }

    const updatedTrack: Track = {
      ...mockTracks[trackIndex],
      title: body.title,
      artist: body.artist,
      album: body.album || '',
      genres: body.genres,
      coverImage: body.coverImage || '',
    };

    mockTracks[trackIndex] = updatedTrack;
    return HttpResponse.json(updatedTrack);
  }),

  // DELETE /api/tracks/:id
  http.delete('/api/tracks/:id', ({ params }) => {
    const trackIndex = mockTracks.findIndex(t => t.id === params.id);
    
    if (trackIndex === -1) {
      return HttpResponse.json(
        { error: 'Track not found', message: 'Track with this ID does not exist' },
        { status: 404 }
      );
    }

    mockTracks.splice(trackIndex, 1);
    return HttpResponse.json({ success: true });
  }),
]; 