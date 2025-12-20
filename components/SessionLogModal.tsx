import React, { useState, useEffect, useRef } from 'react';
import { SessionLog, Tool, TaskType, Outcome, AcceptMode } from '../types';

interface SessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionLog: Omit<SessionLog, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  lastUsedTool?: Tool;
}

const TOOLS: Tool[] = ['Cursor', 'Claude Code', 'Copilot', 'Other'];
const TASK_TYPES: TaskType[] = ['Debugging', 'Refactor', 'New Feature', 'Tests', 'Architecture', 'Docs'];
const OUTCOMES: Outcome[] = ['Worked', 'Partially Worked', "Didn't Work"];
const ACCEPT_MODES: AcceptMode[] = ['As-is', 'Modified', 'Reference'];

const SessionLogModal: React.FC<SessionLogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lastUsedTool = 'Cursor',
}) => {
  const [formData, setFormData] = useState<Omit<SessionLog, 'id' | 'createdAt' | 'userId'>>({
    tool: lastUsedTool,
    taskType: 'Debugging',
    outcome: 'Worked',
    acceptMode: 'As-is',
    timeSaved: 15,
    prompt: '',
    learned: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLSelectElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tool: lastUsedTool,
        taskType: 'Debugging',
        outcome: 'Worked',
        acceptMode: 'As-is',
        timeSaved: 15,
        prompt: '',
        learned: '',
      });
      setErrors({});
      // Focus first input after a brief delay
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, lastUsedTool]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'timeSaved' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tool) {
      newErrors.tool = 'Tool is required';
    }
    if (!formData.taskType) {
      newErrors.taskType = 'Task type is required';
    }
    if (!formData.outcome) {
      newErrors.outcome = 'Outcome is required';
    }
    if (!formData.acceptMode) {
      newErrors.acceptMode = 'Accept mode is required';
    }
    if (!formData.timeSaved || formData.timeSaved <= 0) {
      newErrors.timeSaved = 'Time saved must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting session log:', error);
      setErrors({ submit: 'Failed to save session log. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div
          ref={modalRef}
          className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-medium leading-6 text-gray-900"
                  id="modal-title"
                >
                  Log AI Coding Session
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                  tabIndex={0}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Tool Selection */}
                <div>
                  <label
                    htmlFor="tool"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tool Used <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={firstInputRef}
                    id="tool"
                    name="tool"
                    value={formData.tool}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.tool ? 'border-red-300' : ''
                    }`}
                    required
                  >
                    {TOOLS.map((tool) => (
                      <option key={tool} value={tool}>
                        {tool}
                      </option>
                    ))}
                  </select>
                  {errors.tool && (
                    <p className="mt-1 text-sm text-red-600">{errors.tool}</p>
                  )}
                </div>

                {/* Task Type */}
                <div>
                  <label
                    htmlFor="taskType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Task Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="taskType"
                    name="taskType"
                    value={formData.taskType}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.taskType ? 'border-red-300' : ''
                    }`}
                    required
                  >
                    {TASK_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.taskType && (
                    <p className="mt-1 text-sm text-red-600">{errors.taskType}</p>
                  )}
                </div>

                {/* Outcome */}
                <div>
                  <label
                    htmlFor="outcome"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Outcome <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="outcome"
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.outcome ? 'border-red-300' : ''
                    }`}
                    required
                  >
                    {OUTCOMES.map((outcome) => (
                      <option key={outcome} value={outcome}>
                        {outcome}
                      </option>
                    ))}
                  </select>
                  {errors.outcome && (
                    <p className="mt-1 text-sm text-red-600">{errors.outcome}</p>
                  )}
                </div>

                {/* Accept Mode */}
                <div>
                  <label
                    htmlFor="acceptMode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Accepted AI suggestions <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="acceptMode"
                    name="acceptMode"
                    value={formData.acceptMode}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.acceptMode ? 'border-red-300' : ''
                    }`}
                    required
                  >
                    {ACCEPT_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                  {errors.acceptMode && (
                    <p className="mt-1 text-sm text-red-600">{errors.acceptMode}</p>
                  )}
                </div>

                {/* Time Saved */}
                <div>
                  <label
                    htmlFor="timeSaved"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Roughly how much time did AI save you? <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="timeSaved"
                      name="timeSaved"
                      min="1"
                      max="480"
                      value={formData.timeSaved}
                      onChange={handleChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                        errors.timeSaved ? 'border-red-300' : ''
                      }`}
                      required
                    />
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={formData.timeSaved}
                      onChange={handleChange}
                      name="timeSaved"
                      className="mt-2 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 min</span>
                      <span>60 min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                  {errors.timeSaved && (
                    <p className="mt-1 text-sm text-red-600">{errors.timeSaved}</p>
                  )}
                </div>

                {/* Prompt (Optional) */}
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prompt (optional)
                  </label>
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={3}
                    value={formData.prompt}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="What did you ask the AI?"
                  />
                </div>

                {/* What Did You Learn? (Highlighted) */}
                <div>
                  <label
                    htmlFor="learned"
                    className="block text-sm font-medium text-gray-900 mb-1"
                  >
                    What did you learn?{' '}
                    <span className="text-blue-600 font-normal text-xs">
                      (Important for reflection)
                    </span>
                  </label>
                  <textarea
                    id="learned"
                    name="learned"
                    rows={4}
                    value={formData.learned}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-blue-50"
                    placeholder="What insights did you gain from this session?"
                  />
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isSubmitting ? 'Saving...' : 'Save Session'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                tabIndex={0}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionLogModal;

