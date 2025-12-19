import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import WeeklyMetrics from '../components/WeeklyMetrics';
import WeeklySummaryText from '../components/WeeklySummaryText';
import { getWeeklySummary } from '../controllers/weeklyController';

const WeeklySummary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<Awaited<ReturnType<typeof getWeeklySummary>> | null>(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const data = await getWeeklySummary();
        setWeeklyData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching weekly summary:', err);
        const errorMessage =
          err instanceof Error && err.message === 'User not authenticated'
            ? 'Please sign in to view your weekly summary'
            : 'Failed to load weekly summary';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Summary</h1>
          <p className="mt-2 text-sm text-gray-600">
            Insights from your coding sessions this week
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center text-gray-500">Loading weekly summary...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && weeklyData && weeklyData.metrics.sessionsThisWeek === 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No sessions logged this week.</p>
              <p className="text-sm text-gray-400">
                Start logging your AI coding sessions to see insights here.
              </p>
            </div>
          </div>
        )}

        {/* Weekly Metrics */}
        {!loading && weeklyData && (
          <WeeklyMetrics
            avgTimeSaved={weeklyData.metrics.avgTimeSaved}
            sessionsThisWeek={weeklyData.metrics.sessionsThisWeek}
            learningDensity={weeklyData.metrics.learningDensity}
            acceptVsModifyRatio={weeklyData.metrics.acceptVsModifyRatio}
          />
        )}

        {/* Weekly Summary Text */}
        {!loading && weeklyData && (
          <WeeklySummaryText
            weekStartFormatted={weeklyData.weekStartFormatted}
            summaryText={weeklyData.summaryText}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default WeeklySummary;

