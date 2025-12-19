import React from 'react';

interface WeeklySummaryTextProps {
  weekStartFormatted: string;
  summaryText: string;
}

const WeeklySummaryText: React.FC<WeeklySummaryTextProps> = ({
  weekStartFormatted,
  summaryText,
}) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="text-sm text-gray-500 mb-4">
          Week of: <span className="font-medium text-gray-700">{weekStartFormatted}</span>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{summaryText}</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryText;

