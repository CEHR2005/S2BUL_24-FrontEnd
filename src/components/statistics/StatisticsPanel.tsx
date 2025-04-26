import { useState, useEffect } from 'react';
import { statisticsService } from '../../services';
import { MovieStatistics } from '../../models';

interface StatisticsPanelProps {
  movieId: string;
}

/**
 * Component for displaying detailed statistics about movie ratings
 */
export const StatisticsPanel = ({ movieId }: StatisticsPanelProps) => {
  const [statistics, setStatistics] = useState<MovieStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'age' | 'gender' | 'continent' | 'country'>('age');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await statisticsService.getMovieStatistics(movieId);
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [movieId]);

  if (loading) {
    return <div className="text-center py-10">Loading statistics...</div>;
  }

  if (!statistics) {
    return <div className="text-center py-10 text-gray-500">No statistics available for this movie.</div>;
  }

  const renderChart = (data: Record<string, number> | undefined | null, title: string) => {
    // Add null/undefined check before using Object.values
    const total = data ? Object.values(data).reduce((sum, value) => sum + value, 0) : 0;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {total > 0 ? (
          <div className="space-y-3">
            {Object.entries(data || {}).map(([key, value]) => {
              const percentage = (value / total) * 100;
              return (
                <div key={key} className="relative">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{key}</span>
                    <span className="text-gray-600">{value} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Rating Statistics</h2>

      {/* Tabs for different statistics categories */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'age'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('age')}
        >
          By Age
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'gender'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('gender')}
        >
          By Gender
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'continent'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('continent')}
        >
          By Continent
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'country'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('country')}
        >
          By Country
        </button>
      </div>

      {/* Render the appropriate statistics based on the active tab */}
      {activeTab === 'age' && renderChart(statistics.age_statistics || statistics.age_statistics, 'Distribution by Age Group')}
      {activeTab === 'gender' && renderChart(statistics.gender_statistics || statistics.gender_statistics, 'Distribution by Gender')}
      {activeTab === 'continent' && renderChart(statistics.continent_statistics || statistics.continent_statistics, 'Distribution by Continent')}
      {activeTab === 'country' && renderChart(statistics.country_statistics || statistics.country_statistics, 'Distribution by Country')}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-gray-700">
          This movie has been rated by users from {Object.keys(statistics.country_statistics || statistics.country_statistics || {}).length} countries
          across {Object.keys((statistics.continent_statistics || statistics.continent_statistics || {})).filter(key => (statistics.continent_statistics || statistics.continent_statistics || {})[key] > 0).length} continents.
          {/* Calculate most common country */}
          {(() => {
            const countryStats = statistics.country_statistics || statistics.country_statistics || {};
            const mostCommonCountry = Object.entries(countryStats)
              .sort((a, b) => b[1] - a[1])
              .shift();
            return mostCommonCountry 
              ? ` The most ratings come from ${mostCommonCountry[0]}.` 
              : '';
          })()}
        </p>
        <p className="text-gray-700 mt-2">
          {/* Calculate highest average rating age group */}
          {(() => {
            const ageStats = statistics.age_statistics || statistics.age_statistics || {};
            const ageGroups = {
              'under 18': ageStats.under18 || ageStats.under_18 || 0,
              '18-24': ageStats.age18to24 || ageStats.age_18_to_24 || 0,
              '25-34': ageStats.age25to34 || ageStats.age_25_to_34 || 0,
              '35-44': ageStats.age35to44 || ageStats.age_35_to_44 || 0,
              '45-54': ageStats.age45to54 || ageStats.age_45_to_54 || 0,
              '55+': ageStats.age55plus || ageStats.age_55_plus || 0
            };

            const highestAgeGroup = Object.entries(ageGroups)
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .shift();

            return highestAgeGroup 
              ? `The highest number of ratings is from the ${highestAgeGroup[0]} age group.`
              : 'No age group data available.';
          })()}
        </p>
      </div>
    </div>
  );
};
