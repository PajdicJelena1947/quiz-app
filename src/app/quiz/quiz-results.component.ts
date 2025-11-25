import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { input, output } from '@angular/core';
import { IncorrectQuestion, Quiz, Question } from '../models/quiz.model';

import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  standalone: true,
  selector: 'app-quiz-results',
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './quiz-results.component.html'
})
export class QuizResultsComponent {
  quiz = input.required<Quiz>();
  correct = input<number>(0);
  incorrect = input<IncorrectQuestion[]>([]);
  seconds = input<number>(0);

  restart = output<void>();

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get percentage(): number {
    const total = this.quiz().questions.length;
    if (!total) return 0;
    return Math.round((this.correct() / total) * 100);
  }

  getAnswerText(question: Question, answerId: string | null): string {
    if (!answerId) {
      return 'No answer';
    }
    const ans = question.answers.find(a => a.id === answerId);
    return ans ? ans.text : 'No answer';
  }

  getCorrectAnswerText(question: Question): string {
    const ans = question.answers.find(a => a.id === question.correctAnswerId);
    return ans ? ans.text : '';
  }
}