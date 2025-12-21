import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import WeeklyMetrics from '../components/WeeklyMetrics';
import WeeklySummaryText from '../components/WeeklySummaryText';
import Pill from '../components/ui/Pill';
import { getWeeklySummary, fetchSessionLogsForWeek } from '../controllers/weeklyController';
import {
  getCachedAISummary,
  generateAndCacheAISummary,
  updateCachedAISummary,
} from '../controllers/aiSummaryController';

const WeeklySummary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<Awaited<ReturnType<typeof getWeeklySummary>> | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setLoading(true);
        const data = await getWeeklySummary();
        setWeeklyData(data);

        // Try to load cached AI summary
        try {
          const cached = await getCachedAISummary(data.weekStart);
          setAiSummary(cached);
        } catch (err) {
          // Silently fail - AI summary is optional
          console.warn('Could not load cached AI summary:', err);
        }

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

  const handleGenerateAI = async () => {
    if (!weeklyData) return;

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      const logs = await fetchSessionLogsForWeek(weeklyData.weekStart);
      const summary = await generateAndCacheAISummary(weeklyData, logs);
      setAiSummary(summary);
    } catch (err) {
      console.error('Error generating AI summary:', err);
      setAiError('Failed to generate AI summary. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveAISummary = async (text: string) => {
    if (!weeklyData) return;
    await updateCachedAISummary(weeklyData.weekStart, text);
    setAiSummary(text);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Weekly Summary</h1>
            {!loading && weeklyData && aiSummary && (
              <Pill variant="green">Reflection complete</Pill>
            )}
          </div>
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
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">No sessions this week yet.</p>
              <p className="text-sm text-gray-500">
                Once you log sessions, your weekly reflection will appear here automatically.
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
          <div className="space-y-4">
            {!aiSummary && weeklyData.metrics.sessionsThisWeek > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Get an AI-generated reflection on your week
                  </p>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingAI ? 'Generating...' : 'Generate AI Summary'}
                  </button>
                </div>
                {aiError && (
                  <p className="mt-2 text-sm text-red-600">{aiError}</p>
                )}
              </div>
            )}

            <WeeklySummaryText
              weekStartFormatted={weeklyData.weekStartFormatted}
              summaryText={weeklyData.summaryText}
              aiSummary={aiSummary}
              isEditable={!!aiSummary}
              onSave={handleSaveAISummary}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WeeklySummary;

