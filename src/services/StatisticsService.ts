import { 
  MovieStatistics, 
  AgeStatistics, 
  GenderStatistics, 
  ContinentStatistics, 
  CountryStatistics 
} from '../models';
import { RatingWithUser } from '../models';
import { ratingService } from './RatingService';

/**
 * Service for generating statistics from movie ratings
 */
export class StatisticsService {
  /**
   * Get comprehensive statistics for a movie
   */
  public getMovieStatistics(movieId: string): MovieStatistics {
    const ratings = ratingService.getRatingsByMovieId(movieId);
    const { averageScore, totalRatings } = ratingService.getMovieRating(movieId);

    return {
      movieId,
      averageRating: averageScore,
      totalRatings,
      ageStatistics: this.calculateAgeStatistics(ratings),
      genderStatistics: this.calculateGenderStatistics(ratings),
      continentStatistics: this.calculateContinentStatistics(ratings),
      countryStatistics: this.calculateCountryStatistics(ratings)
    };
  }

  /**
   * Calculate statistics by age group
   */
  private calculateAgeStatistics(ratings: RatingWithUser[]): AgeStatistics {
    const ageStats: AgeStatistics = {
      under18: 0,
      age18to24: 0,
      age25to34: 0,
      age35to44: 0,
      age45to54: 0,
      age55plus: 0
    };

    let totalScoreByAge: { [key: string]: number } = {
      under18: 0,
      age18to24: 0,
      age25to34: 0,
      age35to44: 0,
      age45to54: 0,
      age55plus: 0
    };

    let countByAge: { [key: string]: number } = {
      under18: 0,
      age18to24: 0,
      age25to34: 0,
      age35to44: 0,
      age45to54: 0,
      age55plus: 0
    };

    ratings.forEach(rating => {
      const age = rating.user.age;
      if (age === undefined) return;

      let ageGroup: keyof typeof ageStats;

      if (age < 18) ageGroup = 'under18';
      else if (age >= 18 && age <= 24) ageGroup = 'age18to24';
      else if (age >= 25 && age <= 34) ageGroup = 'age25to34';
      else if (age >= 35 && age <= 44) ageGroup = 'age35to44';
      else if (age >= 45 && age <= 54) ageGroup = 'age45to54';
      else ageGroup = 'age55plus';

      totalScoreByAge[ageGroup] += rating.score;
      countByAge[ageGroup]++;
    });

    // Calculate average for each age group
    Object.keys(ageStats).forEach(key => {
      const ageKey = key as keyof typeof ageStats;
      ageStats[ageKey] = countByAge[ageKey] > 0 
        ? totalScoreByAge[ageKey] / countByAge[ageKey] 
        : 0;
    });

    return ageStats;
  }

  /**
   * Calculate statistics by gender
   */
  private calculateGenderStatistics(ratings: RatingWithUser[]): GenderStatistics {
    const genderStats: GenderStatistics = {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: 0
    };

    let totalScoreByGender: { [key: string]: number } = {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: 0
    };

    let countByGender: { [key: string]: number } = {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: 0
    };

    ratings.forEach(rating => {
      const gender = rating.user.gender;
      let genderGroup: keyof typeof genderStats;

      if (gender === 'male') genderGroup = 'male';
      else if (gender === 'female') genderGroup = 'female';
      else if (gender === 'other') genderGroup = 'other';
      else genderGroup = 'notSpecified';

      totalScoreByGender[genderGroup] += rating.score;
      countByGender[genderGroup]++;
    });

    // Calculate average for each gender
    Object.keys(genderStats).forEach(key => {
      const genderKey = key as keyof typeof genderStats;
      genderStats[genderKey] = countByGender[genderKey] > 0 
        ? totalScoreByGender[genderKey] / countByGender[genderKey] 
        : 0;
    });

    return genderStats;
  }

  /**
   * Calculate statistics by continent
   */
  private calculateContinentStatistics(ratings: RatingWithUser[]): ContinentStatistics {
    const continentStats: ContinentStatistics = {
      africa: 0,
      asia: 0,
      europe: 0,
      northAmerica: 0,
      southAmerica: 0,
      australia: 0,
      antarctica: 0
    };

    let totalScoreByContinent: { [key: string]: number } = {
      africa: 0,
      asia: 0,
      europe: 0,
      northAmerica: 0,
      southAmerica: 0,
      australia: 0,
      antarctica: 0
    };

    let countByContinent: { [key: string]: number } = {
      africa: 0,
      asia: 0,
      europe: 0,
      northAmerica: 0,
      southAmerica: 0,
      australia: 0,
      antarctica: 0
    };

    ratings.forEach(rating => {
      const continent = rating.user.continent;
      if (!continent) return;

      // Map continent string to key in our stats object
      let continentKey: keyof typeof continentStats;

      if (continent.toLowerCase().includes('africa')) continentKey = 'africa';
      else if (continent.toLowerCase().includes('asia')) continentKey = 'asia';
      else if (continent.toLowerCase().includes('europe')) continentKey = 'europe';
      else if (continent.toLowerCase().includes('north america')) continentKey = 'northAmerica';
      else if (continent.toLowerCase().includes('south america')) continentKey = 'southAmerica';
      else if (continent.toLowerCase().includes('australia')) continentKey = 'australia';
      else if (continent.toLowerCase().includes('antarctica')) continentKey = 'antarctica';
      else return; // Skip if continent doesn't match any of our categories

      totalScoreByContinent[continentKey] += rating.score;
      countByContinent[continentKey]++;
    });

    // Calculate average for each continent
    Object.keys(continentStats).forEach(key => {
      const continentKey = key as keyof typeof continentStats;
      continentStats[continentKey] = countByContinent[continentKey] > 0 
        ? totalScoreByContinent[continentKey] / countByContinent[continentKey] 
        : 0;
    });

    return continentStats;
  }

  /**
   * Calculate statistics by country
   */
  private calculateCountryStatistics(ratings: RatingWithUser[]): CountryStatistics {
    const countryStats: CountryStatistics = {};
    const totalScoreByCountry: Record<string, number> = {};
    const countByCountry: Record<string, number> = {};

    ratings.forEach(rating => {
      const country = rating.user.country;
      if (!country) return;

      if (!totalScoreByCountry[country]) {
        totalScoreByCountry[country] = 0;
        countByCountry[country] = 0;
      }

      totalScoreByCountry[country] += rating.score;
      countByCountry[country]++;
    });

    // Calculate average for each country
    Object.keys(totalScoreByCountry).forEach(country => {
      countryStats[country] = countByCountry[country] > 0 
        ? totalScoreByCountry[country] / countByCountry[country] 
        : 0;
    });

    return countryStats;
  }
}

// Export a singleton instance
export const statisticsService = new StatisticsService();
