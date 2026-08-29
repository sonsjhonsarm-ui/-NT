export type SubjectType = "math" | "thai";

export interface NTTableItem {
  label: string;
  value: string;
  numValue?: number;
  highlight?: boolean;
}

export interface NTQuestion {
  id: string;
  year: string;
  subject: SubjectType;
  title: string;
  topic: string;
  questionNumber?: number;
  page?: number;
  questionText: string;
  storyContext?: string;
  tableData?: NTTableItem[];
  choices?: string[];
  correctAnswerIndex?: number;
  expectedAnswer?: string;
  initialHint: string;
  guidingSteps: string[];
  defaultInteractiveType?: "ranking" | "choice" | "open" | "calculation";
}

export interface ThoughtEvaluation {
  effortScore: number; // 0-10
  logicScore: number; // 0-10
  carefulnessScore: number; // 0-10
  totalScore: number; // 0-30
  titleBadge: string;
  praiseText: string;
  feedbackText: string;
  nextClue: string;
  isCompleted: boolean;
  awardedAt?: number;
}

export interface ChatMessage {
  id: string;
  sender: "ptos" | "student";
  text: string;
  timestamp: number;
  evaluation?: ThoughtEvaluation;
  isHint?: boolean;
}

export interface StudentProfile {
  name: string;
  grade: string;
  totalStars: number;
  badges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    date: string;
  }>;
  completedQuestions: string[];
}
