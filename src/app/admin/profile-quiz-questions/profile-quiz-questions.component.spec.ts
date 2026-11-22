import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProfileQuizQuestionsComponent } from './profile-quiz-questions.component';
import { ProfileQuizAdminService } from 'src/app/services/profile-quiz-admin.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ProfileQuizQuestion } from 'src/app/models/profile-quiz.model';

describe('ProfileQuizQuestionsComponent', () => {
  let component: ProfileQuizQuestionsComponent;
  let fixture: ComponentFixture<ProfileQuizQuestionsComponent>;
  let adminService: jasmine.SpyObj<ProfileQuizAdminService>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;

  const question: ProfileQuizQuestion = {
    id: 1, text: 'Goal?', displayOrder: 1, active: true,
    options: [{ id: 10, text: 'Lose weight', displayOrder: 1 }, { id: 11, text: 'Build muscle', displayOrder: 2 }],
  };

  beforeEach(() => {
    adminService = jasmine.createSpyObj('ProfileQuizAdminService', ['getAllQuestions', 'addQuestion', 'updateQuestion', 'deleteQuestion', 'updateStatus']);
    snackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [ProfileQuizQuestionsComponent],
      providers: [
        { provide: ProfileQuizAdminService, useValue: adminService },
        { provide: SnackBarService, useValue: snackBarService },
      ],
    });

    fixture = TestBed.createComponent(ProfileQuizQuestionsComponent);
    component = fixture.componentInstance;
  });

  it('loads and sorts questions by display order', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [{ ...question, id: 2, displayOrder: 2 }, { ...question, id: 1, displayOrder: 1 }], statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.questions.map(q => q.id)).toEqual([1, 2]);
  });

  it('shows a load error when the request fails', () => {
    adminService.getAllQuestions.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(component.loadError).toBeTruthy();
  });

  it('addQuestion() appends a draft row with two blank options and no id', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));
    fixture.detectChanges();

    component.addQuestion();

    expect(component.questions.length).toBe(1);
    expect(component.questions[0].id).toBeNull();
    expect(component.questions[0].options.length).toBe(2);
  });

  it('save() rejects fewer than 2 non-blank options without calling the API', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));
    fixture.detectChanges();
    component.addQuestion();
    const draft = component.questions[0];
    draft.text = 'A question';
    draft.options[0].text = 'Only one';
    draft.options[1].text = '';

    component.save(draft);

    expect(adminService.addQuestion).not.toHaveBeenCalled();
    expect(snackBarService.openSnackBar).toHaveBeenCalled();
  });

  it('save() creates a new question when it has no id yet', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));
    adminService.addQuestion.and.returnValue(of({ success: true, message: 'Question added', data: question, statusCode: 200 } as any));
    fixture.detectChanges();
    component.addQuestion();
    const draft = component.questions[0];
    draft.text = 'Goal?';
    draft.options[0].text = 'Lose weight';
    draft.options[1].text = 'Build muscle';

    component.save(draft);

    expect(adminService.addQuestion).toHaveBeenCalled();
    expect(adminService.updateQuestion).not.toHaveBeenCalled();
    expect(draft.id).toBe(1);
  });

  it('save() updates an existing question', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [question], statusCode: 200 } as any));
    adminService.updateQuestion.and.returnValue(of({ success: true, message: 'Question updated', data: question, statusCode: 200 } as any));
    fixture.detectChanges();

    component.save(component.questions[0]);

    expect(adminService.updateQuestion).toHaveBeenCalled();
  });

  it('toggleStatus() flips the question in place', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [question], statusCode: 200 } as any));
    const flipped = { ...question, active: false };
    adminService.updateStatus.and.returnValue(of({ success: true, message: '', data: flipped, statusCode: 200 } as any));
    fixture.detectChanges();

    component.toggleStatus(component.questions[0]);

    expect(adminService.updateStatus).toHaveBeenCalledWith(1);
    expect(component.questions[0].active).toBeFalse();
  });

  it('delete() on an unsaved draft just removes it locally, with no API call', () => {
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));
    fixture.detectChanges();
    component.addQuestion();

    component.delete(component.questions[0], 0);

    expect(adminService.deleteQuestion).not.toHaveBeenCalled();
    expect(component.questions.length).toBe(0);
  });

  it('delete() on a saved question confirms, then calls the API and removes the row', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [question], statusCode: 200 } as any));
    adminService.deleteQuestion.and.returnValue(of({ success: true, message: '', data: undefined, statusCode: 200 } as any));
    fixture.detectChanges();

    component.delete(component.questions[0], 0);

    expect(adminService.deleteQuestion).toHaveBeenCalledWith(1);
    expect(component.questions.length).toBe(0);
  });

  it('delete() does nothing when the confirmation is declined', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    adminService.getAllQuestions.and.returnValue(of({ success: true, message: '', data: [question], statusCode: 200 } as any));
    fixture.detectChanges();

    component.delete(component.questions[0], 0);

    expect(adminService.deleteQuestion).not.toHaveBeenCalled();
    expect(component.questions.length).toBe(1);
  });
});
