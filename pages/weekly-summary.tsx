import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import WeeklyMetrics from '../components/WeeklyMetrics';
import WeeklySummaryText from '../components/WeeklySummaryText';
import Pill from '../components/ui/Pill';
import { getAllWeeklyData, fetchSessionLogsForWeek } from '../controllers/weeklyController';
import {
  getCachedAISummary,
  generateAndCacheAISummary,
  updateCachedAISummary,
} from '../controllers/aiSummaryController';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setWeeklyInsights,
  setWeeklyInsightsLoading,
  setWeeklyInsightsError,
} from '../store/weeklyInsightsSlice';
import { formatWeekStart } from '../utils/dateHelpers';

const WeeklySummary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWeek, pastWeeks, status, error } = useAppSelector(
    (state) => state.weeklyInsights
  );
  const user = useAppSelector((state) => state.user.user);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [openWeekId, setOpenWeekId] = useState<string | null>(null);

  const loading = status === 'loading';
  const hasError = status === 'error';

  // Fetch ALL weekly data ONCE when user is available and status is idle
  useEffect(() => {
    const fetchAllWeeklyData = async () => {
      // Only fetch if status is idle and user is authenticated
      if (status === 'idle' && user) {
        dispatch(setWeeklyInsightsLoading());
        try {
          const { currentWeek: weekData, pastWeeks: past } = await getAllWeeklyData();
          dispatch(setWeeklyInsights({ currentWeek: weekData, pastWeeks: past }));

          // Load cached AI summary for current week if it exists
          if (weekData) {
            try {
              // Convert ISO string to Date for API call
              const weekStartDate = new Date(weekData.weekStart);
              const cached = await getCachedAISummary(weekStartDate);
              if (cached) {
                setAiSummary(cached);
              }
            } catch (err) {
              // Silently fail - AI summary is optional
            }
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error && err.message === 'User not authenticated'
              ? 'Please sign in to view your weekly summary'
              : 'Failed to load weekly summary';
          dispatch(setWeeklyInsightsError(errorMessage));
        }
      }
    };

    fetchAllWeeklyData();
  }, [status, user, dispatch]);

  const handleGenerateAI = async () => {
    if (!currentWeek) return;

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // Convert ISO string to Date for API call
      const weekStartDate = new Date(currentWeek.weekStart);
      const logs = await fetchSessionLogsForWeek(weekStartDate);
      
      // weekStart is already an ISO string in currentWeek, which is what generateAndCacheAISummary expects
      const summary = await generateAndCacheAISummary(currentWeek, logs);
      setAiSummary(summary);
    } catch (err) {
      setAiError('Failed to generate AI summary. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveAISummary = async (text: string) => {
    if (!currentWeek) return;
    // Convert ISO string to Date for API call
    const weekStartDate = new Date(currentWeek.weekStart);
    await updateCachedAISummary(weekStartDate, text);
    setAiSummary(text);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Weekly Summary</h1>
            {!loading && currentWeek && aiSummary && (
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
        {hasError && !loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Current Week Section */}
        {!loading && !error && currentWeek && (
          <>
            {/* Empty State */}
            {currentWeek.metrics.sessionsThisWeek === 0 && (
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
            <WeeklyMetrics
              avgTimeSaved={currentWeek.metrics.avgTimeSaved}
              sessionsThisWeek={currentWeek.metrics.sessionsThisWeek}
              learningDensity={currentWeek.metrics.learningDensity}
              acceptVsModifyRatio={currentWeek.metrics.acceptVsModifyRatio}
            />

            {/* Weekly Summary Text - Current Week (Editable) */}
            <div className="space-y-4">
              {!aiSummary && currentWeek.metrics.sessionsThisWeek > 0 && (
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
                  {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
                </div>
              )}

              <WeeklySummaryText
                weekStartFormatted={currentWeek.weekStartFormatted}
                summaryText={currentWeek.summaryText}
                aiSummary={aiSummary}
                isEditable={!!aiSummary}
                isReadOnly={false}
                label="This Week"
                onSave={handleSaveAISummary}
              />
            </div>
          </>
        )}

        {/* Past Weeks Section */}
        {!loading && !error && pastWeeks.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Weeks</h2>
            <div className="space-y-3">
              {pastWeeks.map((week) => {
                const weekId = week.id || week.weekStart;
                const weekStartDate = new Date(week.weekStart);
                const isExpanded = openWeekId === weekId;
                const hasSummary = !!week.summary;

                return (
                  <div
                    key={weekId}
                    className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Past Week Card Header */}
                    <button
                      onClick={() => {
                        setOpenWeekId(isExpanded ? null : weekId);
                      }}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center justify-between text-left p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors hover:bg-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            Week of {formatWeekStart(weekStartDate)}
                          </span>
                          {hasSummary && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                              Summary available
                            </span>
                          )}
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
                          isExpanded ? 'transform rotate-90' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                    {/* Past Week Card Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-4 pb-4 pt-2">
                        <div className="bg-white rounded-md p-4 border border-gray-200">
                          <div className="text-sm text-gray-500 mb-2">
                            <span className="font-medium text-gray-700">Previous reflection</span>
                            {' · '}
                            Week of {formatWeekStart(weekStartDate)}
                            {week.summary && (
                              <span className="ml-2 text-xs text-blue-600">AI-generated</span>
                            )}
                          </div>
                          <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {week.summary || 'No summary available'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WeeklySummary;

