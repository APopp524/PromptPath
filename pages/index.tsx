import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import SessionLogModal from '../components/SessionLogModal';
import { useToast } from '../components/ui/Toast';
import Tooltip from '../components/ui/Tooltip';
import { fetchUserSessionLogs, createUserSessionLog } from '../controllers/sessionLogController';
import { computeMetrics } from '../utils/metrics';
import { getLastUsedTool } from '../utils/sessionHelpers';
import { SessionLog } from '../types';

const Dashboard: React.FC = () => {
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const logs = await fetchUserSessionLogs();
      setSessionLogs(logs);
      setError(null);
    } catch (err) {
      console.error('Error fetching session logs:', err);
      const errorMessage =
        err instanceof Error && err.message === 'User not authenticated'
          ? 'Please sign in to view your session logs'
          : 'Failed to load session logs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitSessionLog = async (
    sessionLog: Omit<SessionLog, 'id' | 'createdAt' | 'userId'>
  ) => {
    await createUserSessionLog(sessionLog);
    // Refresh the data after successful submission
    await fetchData();
    // Show success toast
    showToast('Session logged — weekly insights updated.');
  };

  const metrics = computeMetrics(sessionLogs);
  const hasData = sessionLogs.length > 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your AI coding sessions and insights
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center text-gray-500">Loading metrics...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !hasData && (
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-2">Ready to start reflecting?</p>
              <p className="text-sm text-gray-500 mb-4">
                Log your first AI coding session to begin tracking insights and building better habits.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log Your First Session
              </button>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {!loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Average Time Saved */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⏱️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        <Tooltip
                          content="An estimate of how much time AI saved you compared to completing the task manually. This is self-reported and meant to encourage reflection, not precision."
                          side="top"
                        >
                          <span className="inline-flex items-center cursor-help">
                            Avg Time Saved
                            <svg
                              className="ml-1 h-3 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </Tooltip>
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {hasData ? `${metrics.avgTimeSaved} min` : '-- min'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions This Week */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📊</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        <Tooltip
                          content="The number of times you logged an AI-assisted coding session this week. Each session represents a moment of intentional use."
                          side="top"
                        >
                          <span className="inline-flex items-center cursor-help">
                            Sessions This Week
                            <svg
                              className="ml-1 h-3 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </Tooltip>
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {hasData ? metrics.sessionsThisWeek : '--'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Density */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🧠</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        <Tooltip
                          content="A reflection of how much you felt you learned during AI-assisted work. Higher values suggest deeper understanding, not just faster output."
                          side="top"
                        >
                          <span className="inline-flex items-center cursor-help">
                            Learning Density
                            <svg
                              className="ml-1 h-3 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </Tooltip>
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {hasData ? `${metrics.learningDensity}%` : '--%'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Accept vs Modify Ratio */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        <Tooltip
                          content="A comparison of how often you accepted AI output as-is versus modifying it. This can hint at whether AI is acting more as an assistant or a starting point."
                          side="top"
                        >
                          <span className="inline-flex items-center cursor-help">
                            Accept vs Modify
                            <svg
                              className="ml-1 h-3 w-3 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </span>
                        </Tooltip>
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
                        {hasData ? `${metrics.acceptVsModifyRatio}%` : '--%'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Effectiveness Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Task Effectiveness Breakdown
            </h2>
            <p className="text-sm text-gray-500">
              Placeholder: Chart showing where AI helps most — and least
            </p>
          </div>
        </div>

        {/* Session Log Modal Trigger */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Log New Session
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Record your AI coding session in under 60 seconds
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log Session
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Log Modal */}
      <SessionLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitSessionLog}
        lastUsedTool={getLastUsedTool(sessionLogs)}
      />

    </MainLayout>
  );
};

export default Dashboard;

