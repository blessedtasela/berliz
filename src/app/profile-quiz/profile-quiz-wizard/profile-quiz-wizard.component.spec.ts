import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProfileQuizWizardComponent } from './profile-quiz-wizard.component';
import { ProfileQuizService } from 'src/app/services/profile-quiz.service';
import { ProfileQuizQuestion } from 'src/app/models/profile-quiz.model';

describe('ProfileQuizWizardComponent', () => {
  let component: ProfileQuizWizardComponent;
  let fixture: ComponentFixture<ProfileQuizWizardComponent>;
  let service: jasmine.SpyObj<ProfileQuizService>;
  let router: jasmine.SpyObj<Router>;

  const questions: ProfileQuizQuestion[] = [
    { id: 1, text: 'Q1', displayOrder: 1, active: true, options: [{ id: 10, text: 'A', displayOrder: 1 }, { id: 11, text: 'B', displayOrder: 2 }], answeredOptionId: null },
    { id: 2, text: 'Q2', displayOrder: 2, active: true, options: [{ id: 20, text: 'C', displayOrder: 1 }, { id: 21, text: 'D', displayOrder: 2 }], answeredOptionId: null },
  ];

  function setup(returnUrl: string | null = null) {
    service = jasmine.createSpyObj('ProfileQuizService', ['getQuestions', 'submitAnswers', 'getStatus']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    TestBed.configureTestingModule({
      imports: [ProfileQuizWizardComponent],
      providers: [
        { provide: ProfileQuizService, useValue: service },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}) } } },
      ],
    });

    fixture = TestBed.createComponent(ProfileQuizWizardComponent);
    component = fixture.componentInstance;
  }

  it('starts on the first unanswered question, prefilling earlier answers', () => {
    setup();
    const withOneAnswered = [
      { ...questions[0], answeredOptionId: 10 },
      { ...questions[1] },
    ];
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: withOneAnswered, statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.step).toBe(1);
    expect(component.answersByQuestionId[1]).toBe(10);
  });

  it('next() is blocked until the current question has an answer', () => {
    setup();
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: questions, statusCode: 200 } as any));
    fixture.detectChanges();

    component.next();

    expect(component.step).toBe(0);
  });

  it('choosing an option then next() advances to the following question', () => {
    setup();
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: questions, statusCode: 200 } as any));
    fixture.detectChanges();

    component.choose(10);
    component.next();

    expect(component.step).toBe(1);
  });

  it('finish() submits every answered question and shows the completion state', () => {
    setup();
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: questions, statusCode: 200 } as any));
    service.submitAnswers.and.returnValue(of({ success: true, message: '', data: undefined, statusCode: 200 } as any));
    fixture.detectChanges();

    component.choose(10);
    component.next();
    component.choose(21);
    component.next();

    expect(service.submitAnswers).toHaveBeenCalledWith([{ questionId: 1, optionId: 10 }, { questionId: 2, optionId: 21 }]);
    expect(component.finished).toBeTrue();
  });

  it('shows an error and does not mark finished when submission fails', () => {
    setup();
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: [questions[0]], statusCode: 200 } as any));
    service.submitAnswers.and.returnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();

    component.choose(10);
    component.next();

    expect(component.finished).toBeFalse();
    expect(component.submitError).toBeTruthy();
  });

  it('skip() navigates to the default /dashboard without submitting', () => {
    setup();
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: questions, statusCode: 200 } as any));
    fixture.detectChanges();

    component.skip();

    expect(service.submitAnswers).not.toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('skip() honors a same-origin returnUrl', () => {
    setup('/dashboard/hub/profile-quiz-questions');
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: questions, statusCode: 200 } as any));
    fixture.detectChanges();

    component.skip();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard/hub/profile-quiz-questions');
  });

  it('ignores a returnUrl that is not a relative path (open-redirect guard)', () => {
    setup('https://evil.example.com');
    service.getQuestions.and.returnValue(of({ success: true, message: '', data: questions, statusCode: 200 } as any));
    fixture.detectChanges();

    component.skip();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('shows a load error when the questions request fails', () => {
    setup();
    service.getQuestions.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(component.loadError).toBeTruthy();
  });
});
