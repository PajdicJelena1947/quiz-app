import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { QuizContainerComponent } from './app/quiz/quiz-container.component';

bootstrapApplication(QuizContainerComponent, {
  providers: [
    provideHttpClient(),
  ]
});