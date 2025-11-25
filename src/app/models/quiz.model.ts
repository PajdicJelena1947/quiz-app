export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  answers: Answer[];
  correctAnswerId: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface QuizResponse {
  quizzes: Quiz[];
}

export interface IncorrectQuestion {
  question: Question;
  selectedAnswerId: string | null;
}
