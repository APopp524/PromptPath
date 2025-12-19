import React from 'react';

interface WeeklyMetricsProps {
  avgTimeSaved: number;
  sessionsThisWeek: number;
  learningDensity: number;
  acceptVsModifyRatio: number;
}

const WeeklyMetrics: React.FC<WeeklyMetricsProps> = ({
  avgTimeSaved,
  sessionsThisWeek,
  learningDensity,
  acceptVsModifyRatio,
}) => {
  return (
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
                  Avg Time Saved
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {avgTimeSaved > 0 ? `${avgTimeSaved} min` : '-- min'}
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
                  Sessions This Week
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {sessionsThisWeek > 0 ? sessionsThisWeek : '--'}
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
                  Learning Density
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {learningDensity > 0 ? `${learningDensity}%` : '--%'}
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
                  Accept vs Modify
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {acceptVsModifyRatio > 0 ? `${acceptVsModifyRatio}%` : '--%'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMetrics;

