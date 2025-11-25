import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { input, model } from '@angular/core';
import { Question } from '../models/quiz.model';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  standalone: true,
  selector: 'app-question-card',
  imports: [CommonModule, MatRadioModule],
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.css']
})
export class QuestionCardComponent {
  question = input.required<Question>();
  selected = model<string | null>(null);
}
