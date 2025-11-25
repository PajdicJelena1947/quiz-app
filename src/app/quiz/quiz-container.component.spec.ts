import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { QuizContainerComponent } from './quiz-container.component';
import { QuizService } from '../services/quiz.service';
import { Quiz } from '../models/quiz.model';

const mockQuizA: Quiz = {
    id: 'quiz-a',
    title: 'Quiz A',
    questions: [
        {
            id: 1,
            question: 'Question A1?',
            answers: [
                { id: 'a1', text: 'Answer A1' },
                { id: 'a2', text: 'Answer A2' }
            ],
            correctAnswerId: 'a1'
        }
    ]
};

const mockQuizB: Quiz = {
    id: 'quiz-b',
    title: 'Quiz B',
    questions: [
        {
            id: 1,
            question: 'Question B1?',
            answers: [
                { id: 'b1', text: 'Answer B1' },
                { id: 'b2', text: 'Answer B2' }
            ],
            correctAnswerId: 'b2'
        }
    ]
};

const mockQuizList: Quiz[] = [mockQuizA, mockQuizB];

// mock service implementing both methods
const quizServiceMock: Partial<QuizService> = {
    getAllQuizzes: () => of(mockQuizList),
    getQuiz: (id: string) =>
        of(mockQuizList.find(q => q.id === id))
};

describe('QuizContainerComponent', () => {
    let fixture: ComponentFixture<QuizContainerComponent>;
    let component: QuizContainerComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QuizContainerComponent],
            providers: [
                { provide: QuizService, useValue: quizServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(QuizContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should load quiz list and initial quiz on init', () => {
        // quiz list for selector
        expect(component.quizzes()).toEqual(mockQuizList);

        // default loaded quiz is quiz-a
        expect(component.quiz()).toEqual(mockQuizA);
        expect(component.currentQuizId()).toBe('quiz-a');

        // state flags
        expect(component.loading()).toBeFalsy();
        expect(component.error()).toBeNull();

        // quiz has not started yet
        expect(component.quizStarted()).toBeFalsy();
        expect(component.quizFinished()).toBeFalsy();
        expect(component.currentIndex()).toBe(0);
        expect(component.total()).toBe(mockQuizA.questions.length);
    });

    it('should start quiz and initialize timers', () => {
        // starting from quiz-a
        expect(component.quiz()).toEqual(mockQuizA);

        component.startQuiz();

        expect(component.quizStarted()).toBeTruthy();
        expect(component.quizFinished()).toBeFalsy();
        expect(component.currentIndex()).toBe(0);

        // quiz timer starts from 0
        expect(component.quizSeconds()).toBe(0);
        // first question's timer starts from QUESTION_LIMIT
        expect(component.questionSecondsLeft()).toBe(component.QUESTION_LIMIT);
    });
});