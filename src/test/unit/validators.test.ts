import { describe, it, expect } from 'vitest';
import { parseTrack, parsePaginatedTracks, safeParsePaginatedTracks } from '@/lib/validators';

describe('Track Validators - Blackbox Testing', () => {
  describe('parseTrack', () => {
    it('should successfully parse valid track data', () => {
      const validTrackData = {
        id: '1',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        genres: ['Rock', 'Pop'],
        coverImage: 'https://example.com/cover.jpg',
        audioFile: 'https://example.com/audio.mp3',
      };

      const result = parseTrack(validTrackData);
      
      expect(result).toEqual(validTrackData);
      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Track');
      expect(result.artist).toBe('Test Artist');
      expect(result.genres).toEqual(['Rock', 'Pop']);
    });

    it('should throw error for invalid track data', () => {
      const invalidTrackData = {
        id: '',
        title: '',
        artist: '',
        genres: [],
      };

      expect(() => parseTrack(invalidTrackData)).toThrow();
    });

    it('should handle track without optional fields', () => {
      const minimalTrackData = {
        id: '1',
        title: 'Test Track',
        artist: 'Test Artist',
        genres: ['Rock'],
      };

      const result = parseTrack(minimalTrackData);
      
      expect(result.id).toBe('1');
      expect(result.title).toBe('Test Track');
      expect(result.artist).toBe('Test Artist');
      expect(result.genres).toEqual(['Rock']);
      expect(result.album).toBeUndefined();
      expect(result.coverImage).toBeUndefined();
      expect(result.audioFile).toBeUndefined();
    });
  });

  describe('parsePaginatedTracks', () => {
    it('should successfully parse paginated tracks response', () => {
      const paginatedData = {
        data: [
          {
            id: '1',
            title: 'Track 1',
            artist: 'Artist 1',
            genres: ['Rock'],
          },
          {
            id: '2',
            title: 'Track 2',
            artist: 'Artist 2',
            genres: ['Pop'],
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const result = parsePaginatedTracks(paginatedData);
      
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should throw error for invalid paginated data', () => {
      const invalidData = {
        data: [],
        meta: {
          total: -1,
          page: 0,
          limit: 10,
          totalPages: 1,
        },
      };

      expect(() => parsePaginatedTracks(invalidData)).toThrow();
    });
  });

  describe('safeParsePaginatedTracks', () => {
    it('should return success result for valid paginated data', () => {
      const validData = {
        data: [
          {
            id: '1',
            title: 'Track 1',
            artist: 'Artist 1',
            genres: ['Rock'],
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const result = safeParsePaginatedTracks(validData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(1);
        expect(result.data.meta.total).toBe(1);
      }
    });

    it('should return error result for invalid paginated data', () => {
      const invalidData = {
        data: 'not an array',
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      const result = safeParsePaginatedTracks(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
}); 