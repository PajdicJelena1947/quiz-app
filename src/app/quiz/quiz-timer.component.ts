import { Component } from '@angular/core';
import { input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-quiz-timer',
  templateUrl: './quiz-timer.component.html'
})
export class QuizTimerComponent {
  quizTime = input<string>('00:00');
  questionSecondsLeft = input<number>(0);
}
