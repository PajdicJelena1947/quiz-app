import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Quiz, QuizResponse } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly url = 'mock-quizzes.json';
  private readonly quizzes$: Observable<QuizResponse>;

  constructor(private http: HttpClient) {
    this.quizzes$ = this.http.get<QuizResponse>(this.url).pipe(
      shareReplay(1),
      catchError(error => {
        console.error('Failed to load quizzes JSON', error);
        return throwError(() => error);
      })
    );
  }

  getQuiz(id: string): Observable<Quiz | undefined> {
    return this.quizzes$.pipe(
      map(res => res.quizzes.find(q => q.id === id))
    );
  }

  getAllQuizzes(): Observable<Quiz[]> {
    return this.quizzes$.pipe(map(res => res.quizzes));
  }
}
