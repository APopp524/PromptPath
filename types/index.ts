export type Tool = 'Cursor' | 'Claude Code' | 'Copilot' | 'Other';

export type TaskType = 
  | 'Debugging' 
  | 'Refactor' 
  | 'New Feature' 
  | 'Tests' 
  | 'Architecture' 
  | 'Docs';

export type Outcome = 'Worked' | 'Partially Worked' | "Didn't Work";

export type AcceptMode = 'As-is' | 'Modified' | 'Reference';

export interface SessionLog {
  id?: string;
  tool: Tool;
  taskType: TaskType;
  outcome: Outcome;
  acceptMode: AcceptMode;
  timeSaved: number; // in minutes
  prompt?: string;
  learned?: string;
  createdAt?: string;
  userId?: string;
}

export interface WeeklyInsights {
  id?: string;
  weekStart: string;
  bestPerformingTasks: string[];
  weakAreas: string[];
  learningTrends: string;
  recommendation: string;
  summary?: string;
  createdAt?: string;
  userId?: string;
}

