import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { QuizService } from '../services/quiz.service';
import { IncorrectQuestion, Question, Quiz } from '../models/quiz.model';

import { QuizProgressComponent } from './quiz-progress.component';
import { QuizTimerComponent } from './quiz-timer.component';
import { QuestionCardComponent } from './question-card.component';
import { QuestionNavigationComponent } from './question-navigation.component';
import { QuizResultsComponent } from './quiz-results.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-quiz-container',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    QuizProgressComponent,
    QuizTimerComponent,
    QuestionCardComponent,
    QuestionNavigationComponent,
    QuizResultsComponent
  ],
  templateUrl: './quiz-container.component.html',
  styleUrls: ['./quiz-container.component.css'],
})
export class QuizContainerComponent {
  // data
  quiz = signal<Quiz | null>(null);
  quizzes = signal<Quiz[] | null>([]);

  // UI state
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // quiz state
  quizStarted = signal(false);
  quizFinished = signal(false);
  currentIndex = signal(0);
  currentQuizId = signal<string>('quiz-a');

  readonly QUESTION_LIMIT = 42;
  quizSeconds = signal(0);
  questionSecondsLeft = signal(this.QUESTION_LIMIT);

  private quizTimerSub: Subscription | null = null;
  private questionTimerSub: Subscription | null = null;
  private quizStartTime = 0;
  private quizEndTime = 0;

  private perQuestionSeconds: Record<number, number> = {};

  selectedAnswers: Record<number, string | null> = {};
  correctCount = 0;
  incorrect: IncorrectQuestion[] = [];

  total = computed(() => {
    const q = this.quiz();
    return q ? q.questions.length : 0;
  });

  question = computed<Question | null>(() => {
    const qz = this.quiz();
    if (!qz) return null;
    const idx = this.currentIndex();
    return qz.questions[idx] ? qz.questions[idx] : null;
  });

  constructor(private quizService: QuizService) {

  }

  ngOnInit(): void {
    // load list of all quizzes (for buttons)
    this.quizService.getAllQuizzes()
      .pipe(
        catchError(err => {
          console.error('Error loading quiz list', err);
          return of<Quiz[]>([]);
        })
      )
      .subscribe(list => {
        this.quizzes.set(list);
      });

    this.loadQuiz('quiz-a');
  }

  loadQuiz(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.quiz.set(null);

    this.quizService
      .getQuiz(id)
      .pipe(
        catchError(err => {
          console.error('Error in container while loading quiz', err);
          this.error.set('Could not load quiz data. Please try again.');
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe(q => {
        if (!q) {
          // already handled as error above
          return;
        }
        this.quiz.set(q);
        this.loading.set(false);
      });
  }

  startQuiz(): void {
    const quiz = this.quiz();
    if (!quiz) return;

    this.quizStarted.set(true);
    this.quizFinished.set(false);
    this.currentIndex.set(0);

    this.selectedAnswers = {};
    this.correctCount = 0;
    this.incorrect = [];

    this.quizSeconds.set(0);
    this.quizStartTime = Date.now();

    // init per-question remaining time
    this.perQuestionSeconds = {};
    for (const q of quiz.questions) {
      this.perQuestionSeconds[q.id] = this.QUESTION_LIMIT;
    }

    this.clearTimers();
    this.startQuizTimer();
    this.startQuestionTimer();
  }

  restart(): void {
    this.startQuiz();
  }

  finish(): void {
    this.quizFinished.set(true);
    this.quizStarted.set(false);
    this.quizEndTime = Date.now();

    this.clearTimers();
    this.evaluateResults();
  }

  // TIMERS (quiz)

  private startQuizTimer(): void {
    this.quizTimerSub = interval(1000).subscribe(() => {
      this.quizSeconds.update(v => v + 1);
    });
  }

  // TIMERS (per-question with remembered time)

  private startQuestionTimer(): void {
    const current = this.question();
    if (!current) return;

    const remaining = this.perQuestionSeconds[current.id] ?? this.QUESTION_LIMIT;
    this.questionSecondsLeft.set(remaining);

    if (this.questionTimerSub) {
      this.questionTimerSub.unsubscribe();
      this.questionTimerSub = null;
    }

    this.questionTimerSub = interval(1000).subscribe(() => {
      const q = this.question();
      if (!q) return;

      const oldRemaining = this.perQuestionSeconds[q.id] ?? this.QUESTION_LIMIT;
      const next = oldRemaining - 1;
      const clamped = Math.max(0, next);

      this.perQuestionSeconds[q.id] = clamped;
      this.questionSecondsLeft.set(clamped);

      if (clamped <= 0) {
        if (this.questionTimerSub) {
          this.questionTimerSub.unsubscribe();
          this.questionTimerSub = null;
        }
        this.next(true);
      }
    });
  }

  private clearTimers(): void {
    if (this.quizTimerSub) {
      this.quizTimerSub.unsubscribe();
      this.quizTimerSub = null;
    }
    if (this.questionTimerSub) {
      this.questionTimerSub.unsubscribe();
      this.questionTimerSub = null;
    }
  }

  // NAVIGATION

  next(fromTimeout: boolean = false): void {
    const idx = this.currentIndex();
    const total = this.total();

    if (idx < total - 1) {
      this.currentIndex.set(idx + 1);
      this.startQuestionTimer();
    } else {
      this.finish();
    }
  }

  prev(): void {
    const idx = this.currentIndex();
    if (idx > 0) {
      this.currentIndex.set(idx - 1);
      this.startQuestionTimer();
    }
  }

  // RESULTS

  private evaluateResults(): void {
    const quiz = this.quiz();
    if (!quiz) return;

    let correct = 0;
    const incorrectList: IncorrectQuestion[] = [];

    for (const q of quiz.questions) {
      const selected =
        this.selectedAnswers[q.id] != null ? this.selectedAnswers[q.id] : null;

      if (selected === q.correctAnswerId) {
        correct++;
      } else {
        incorrectList.push({ question: q, selectedAnswerId: selected });
      }
    }

    this.correctCount = correct;
    this.incorrect = incorrectList;

    const ms = this.quizEndTime - this.quizStartTime;
    this.quizSeconds.set(Math.round(ms / 1000));
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}