import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import type { MovieStatistics } from '../models';

/* 1. Mocking ONLY ApiService ------------------------------------ */
vi.mock('./ApiService', () => ({
  apiService: { get: vi.fn() },
}));

/* 2. Importing the mock object */
import { apiService } from './ApiService';

/* 3. Late import of StatisticsService after mocks --------------- */
let statisticsService: typeof import('./StatisticsService')['statisticsService'];

beforeAll(async () => {
  vi.resetModules();                               // clear modules cache
  const mod = await vi.importActual<
      typeof import('./StatisticsService')
  >('./StatisticsService');
  statisticsService = mod.statisticsService;       // real singleton
});

/* ---------------- The tests follow below ------------------------ */
describe('StatisticsService', () => {
  const mockMovieId = 'movie1';
  const mockStats: MovieStatistics = {
    movie_id: mockMovieId,
    average_rating: 4.5,
    total_ratings: 10,
    age_statistics: {
      under18: 4.3,
      age18to24: 4.3,
      age25to34: 4.6,
      age35to44: 4.7,
      age45to54: 4.5,
      age55plus: 4.2,
    },
    gender_statistics: { male: 4.2, female: 4.8, other: 4, notSpecified: 0 },
    continent_statistics: {
      africa: 0,
      asia: 0,
      europe: 4.6,
      northAmerica: 4.4,
      southAmerica: 0,
      australia: 4.7,
      antarctica: 0,
    },
    country_statistics: { USA: 4.4, UK: 4.6, Canada: 4.5, Australia: 4.7 },
  };

  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.resetAllMocks());

  describe('getMovieStatistics', () => {
    it('returns statistics on successful request', async () => {
      vi.mocked(apiService.get).mockResolvedValueOnce(mockStats);

      const result = await statisticsService.getMovieStatistics(mockMovieId);

      expect(apiService.get).toHaveBeenCalledWith(`/statistics/movie/${mockMovieId}`);
      expect(result).toEqual(mockStats);
    });

    it('throws an error on failed request', async () => {
      vi.mocked(apiService.get).mockRejectedValueOnce(new Error('Failed to get statistics'));

      await expect(
          statisticsService.getMovieStatistics(mockMovieId),
      ).rejects.toThrow('Failed to get statistics');
    });
  });
});
