import React, { useState } from 'react';

interface WeeklySummaryTextProps {
  weekStartFormatted: string;
  summaryText: string;
  aiSummary?: string | null;
  isEditable?: boolean;
  onSave?: (text: string) => Promise<void>;
}

const WeeklySummaryText: React.FC<WeeklySummaryTextProps> = ({
  weekStartFormatted,
  summaryText,
  aiSummary,
  isEditable = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const displayText = aiSummary || summaryText;
  const isAISummary = !!aiSummary;

  const handleEdit = () => {
    setEditedText(displayText);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(editedText);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving summary:', error);
      alert('Failed to save summary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedText('');
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            Week of: <span className="font-medium text-gray-700">{weekStartFormatted}</span>
            {isAISummary && (
              <span className="ml-2 text-xs text-blue-600">AI-generated</span>
            )}
          </div>
          {isEditable && isAISummary && !isEditing && (
            <button
              onClick={handleEdit}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        <div className="prose max-w-none">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={6}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-normal"
                placeholder="Enter your weekly reflection..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{displayText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryText;

