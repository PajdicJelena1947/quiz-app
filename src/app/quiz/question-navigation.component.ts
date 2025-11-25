import { Component } from '@angular/core';
import { input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-question-navigation',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './question-navigation.component.html',
  styleUrls: ['./question-navigation.component.css']
})
export class QuestionNavigationComponent {
  index = input.required<number>();
  total = input.required<number>();

  prev = output<void>();
  next = output<void>();
  finish = output<void>();
}
