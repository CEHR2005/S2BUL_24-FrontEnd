/**
 * Represents statistics for movie ratings by age group
 */
export interface AgeStatistics {
  under18: number;
  age18to24: number;
  age25to34: number;
  age35to44: number;
  age45to54: number;
  age55plus: number;
  [key: string]: number;
}

/**
 * Represents statistics for movie ratings by gender
 */
export interface GenderStatistics {
  male: number;
  female: number;
  other: number;
  notSpecified: number;
  [key: string]: number;
}

/**
 * Represents statistics for movie ratings by continent
 */
export interface ContinentStatistics {
  africa: number;
  asia: number;
  europe: number;
  northAmerica: number;
  southAmerica: number;
  australia: number;
  antarctica: number;
  [key: string]: number;
}

/**
 * Represents statistics for movie ratings by country
 */
export interface CountryStatistics {
  [countryCode: string]: number;
}

/**
 * Represents all statistics for a movie
 */
export interface MovieStatistics {
  movie_id: string;
  average_rating  : number;
  total_ratings: number;
  age_statistics: AgeStatistics;
  gender_statistics: GenderStatistics;
  continent_statistics: ContinentStatistics;
  country_statistics: CountryStatistics;
}
