import { Component } from '@angular/core';
import { input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-quiz-progress',
  templateUrl: './quiz-progress.component.html'
})
export class QuizProgressComponent {
  current = input.required<number>();
  total = input.required<number>();
}
